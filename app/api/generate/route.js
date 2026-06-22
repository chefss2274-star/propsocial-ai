import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerUser, getServerSubscription, activeTier } from '../../../lib/auth';

const IS_PROD = process.env.NODE_ENV === 'production';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1500;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const BASE_SYSTEM = `You are PropSocial AI, an expert copywriter for residential real-estate agents.

You take a single property — described as raw notes, a listing link (Zillow / Redfin / MLS), or a transcribed walkthrough — and return THREE social-media post variations, each tuned for a different platform and audience.

You MUST emit your response by calling the \`emit_variations\` tool. Never include preamble, markdown, or commentary around the tool call.

Variation rules:
- "professional" — Data-heavy, formal copy for LinkedIn or Zillow descriptions. Lead with the property's hard specs (beds, baths, sq ft, lot size). Use a short bullet list for key features. End with a clear call to action. ~200–350 characters. Fair-Housing-Act compliant.
- "hype" — Punchy, scroll-stopping copy for Instagram or TikTok captions. Open with a viral hook ("STOP scrolling", "POV:", numbered shock-bullets). Heavy emoji use, line breaks, all-caps for impact, and a hashtag swarm at the end. ~150–250 characters.
- "neighborhood" — Warm, community-first storytelling for Facebook neighborhood groups. Emphasize walkability and adjacency to nearby hotspots (schools, parks, coffee shops, transit) by name when possible. First-person voice from the agent. Conversational, ~250–400 characters.

Always:
- Tailor each variation to the provided property type, target city, and tone bias.
- Stay compliant with the Fair Housing Act — no demographic descriptors of buyers or neighborhoods.
- Never invent legal disclosures, MLS numbers, or exact prices unless the user provided them.`;

const LUXURY_SUFFIX = `

Luxury / Ultra-Luxury Tone Protocol (Pro tier active):
- Elevate vocabulary: prefer "residence" over "house", "appointed" over "decorated", "private grounds" over "yard".
- Reference quality cues by name when present: marque appliances (Wolf, Sub-Zero, Miele), stone provenance (Calacatta, Carrara), architect or designer pedigree.
- Open the "professional" variant with a single evocative sentence before specs.
- In "hype", trade frantic emojis for cinematic ones (✨🥂🤍 over 🤯🛑⚡); the energy is restrained, aspirational, never desperate.
- In "neighborhood", emphasize discretion, privacy, and proximity to cultural anchors (galleries, fine dining, club access) over walkability to chain retail.`;

const EMIT_TOOL = {
  name: 'emit_variations',
  description:
    'Return exactly three social-media post variations as structured JSON. All three keys are required.',
  input_schema: {
    type: 'object',
    properties: {
      professional: {
        type: 'string',
        description:
          'Formal, data-heavy LinkedIn/Zillow-style copy. Specs first, bullet features, clear CTA.'
      },
      hype: {
        type: 'string',
        description:
          'Punchy short-form Instagram/TikTok caption with viral hook and emoji-rich formatting.'
      },
      neighborhood: {
        type: 'string',
        description:
          'Warm Facebook-group post emphasizing local hotspots, walkability, and community.'
      }
    },
    required: ['professional', 'hype', 'neighborhood'],
    additionalProperties: false
  }
};

// Last-resort fallback content used only when ANTHROPIC_API_KEY is missing on
// the server (local dev without env). Keeps the UI usable for design iteration.
const FALLBACK_CONTENT = {
  professional:
    "Just listed: a meticulously maintained 4-bed, 3-bath residence offering 2,840 sq ft of refined living. Open-concept kitchen with quartz countertops, finished walk-out basement, and a landscaped half-acre lot. Top-rated school district. Private tours available this weekend by appointment.",
  hype:
    "STOP. SCROLLING. 🛑✨\n\nThis listing just BROKE my brain 🤯🏡\n\n→ 4 beds. 3 baths. ONE iconic kitchen 👀\n→ That backyard? Pinterest energy 🌳\n→ Natural light?? CINEMATIC ☀️\n\nComment \"TOUR\" for the video 📲\n\n#DreamHome #JustListed",
  neighborhood:
    "Hey neighbors! 👋 A wonderful family home just hit the market on Oak Street — three blocks from the elementary school and a short walk to the Saturday farmer's market. The current owners raised their kids here over 18 years. Send your friends my way — I'd love to help them call this block home. 💚"
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { propertyNotes, propertyType, city, tone, tier: clientTier } = body ?? {};

  if (
    typeof propertyNotes !== 'string' ||
    propertyNotes.trim().length < 5
  ) {
    return NextResponse.json(
      {
        error: 'missing_property_notes',
        hint: 'Provide propertyNotes with property details or a listing link.'
      },
      { status: 400 }
    );
  }

  // Session + tier enforcement. In production the tier is read from the DB
  // — never trusted from the client. In dev, we accept a `tier` from the
  // request body so the demo bypass buttons still work without Supabase set up.
  let resolvedTier;
  const user = await getServerUser();

  if (user) {
    const subscription = await getServerSubscription(user.id);
    resolvedTier = activeTier(subscription);
    if (!resolvedTier) {
      return NextResponse.json(
        {
          error: 'no_active_subscription',
          message: 'Your subscription is not active. Choose a plan to continue.'
        },
        { status: 403 }
      );
    }
  } else if (!IS_PROD && (clientTier === 'starter' || clientTier === 'pro')) {
    resolvedTier = clientTier;
  } else {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'Sign in to generate posts.' },
      { status: 401 }
    );
  }

  // Local dev fallback so the UI flow still works without an API key set.
  if (!anthropic) {
    return NextResponse.json({
      variations: FALLBACK_CONTENT,
      stub: true,
      hint: 'ANTHROPIC_API_KEY not set on the server — returning placeholder copy.'
    });
  }

  const isPro = resolvedTier === 'pro';
  // Two system blocks so the base prompt can be cached independently of the
  // optional Pro suffix — keeps cache hits warm across Starter + Pro traffic
  // once the prompt grows past the cache-eligibility threshold.
  const systemBlocks = [
    {
      type: 'text',
      text: BASE_SYSTEM,
      cache_control: { type: 'ephemeral' }
    }
  ];
  if (isPro) {
    systemBlocks.push({ type: 'text', text: LUXURY_SUFFIX });
  }

  const userMessage = [
    `Property type: ${propertyType ?? 'unspecified'}`,
    `Target city: ${city ?? 'unspecified'}`,
    `Tone bias: ${tone ?? 'Balanced'}`,
    '',
    'Listing notes / link / transcript:',
    propertyNotes.trim(),
    '',
    'Generate the three variations now via the emit_variations tool.'
  ].join('\n');

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemBlocks,
      tools: [EMIT_TOOL],
      tool_choice: { type: 'tool', name: 'emit_variations' },
      messages: [{ role: 'user', content: userMessage }]
    });

    const toolUse = response.content.find((b) => b.type === 'tool_use');
    if (!toolUse) {
      return NextResponse.json(
        { error: 'no_tool_call', stop_reason: response.stop_reason },
        { status: 502 }
      );
    }

    const { professional, hype, neighborhood } = toolUse.input ?? {};
    if (!professional || !hype || !neighborhood) {
      return NextResponse.json(
        { error: 'incomplete_output', got: toolUse.input },
        { status: 502 }
      );
    }

    return NextResponse.json({
      variations: { professional, hype, neighborhood },
      tier: isPro ? 'pro' : 'starter',
      model: response.model,
      usage: response.usage
    });
  } catch (err) {
    console.error('Anthropic generate error', err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    return NextResponse.json(
      { error: 'anthropic_error', message: err?.message ?? 'unknown' },
      { status }
    );
  }
}
