// Mock variations let the UI feel "alive" before live LLM APIs are wired up.
// Swap these out for a real generation call in `handleGenerate` later.

export const mockVariations = [
  {
    id: 'professional',
    title: 'Professional & Informative',
    platform: 'LinkedIn / Zillow',
    icon: 'Briefcase',
    accent: 'sky',
    content: `Just listed in Maplewood: a meticulously maintained 4-bed, 3-bath single-family residence offering 2,840 sq ft of refined living space on a landscaped half-acre lot.

Key highlights:
• Open-concept chef's kitchen with quartz countertops and Bosch appliances
• Finished walk-out basement with dedicated home office
• Energy-efficient HVAC and roof replaced in 2023
• Top-rated Lincoln Elementary district
• Two-car attached garage, EV-ready

Offered at $895,000. Private showings available this weekend by appointment.

#JustListed #RealEstate #MaplewoodHomes`
  },
  {
    id: 'hype',
    title: 'High-Energy & Engaging',
    platform: 'Instagram / TikTok',
    icon: 'Zap',
    accent: 'fuchsia',
    content: `STOP. SCROLLING. 🛑✨

This Maplewood listing just BROKE my brain 🤯🏡

→ 4 beds. 3 baths. ONE iconic kitchen 👀
→ That backyard? Straight out of a Pinterest board 🌳
→ The natural light?? CINEMATIC ☀️
→ Walk-out basement = main character energy 💅

Comment "TOUR" and I'll slide into your DMs with the full video 📲

I'm telling you — this one's going to move FAST. ⚡

#DreamHome #HouseTour #JustListed #RealtorLife`
  },
  {
    id: 'community',
    title: 'Local & Community-First',
    platform: 'Facebook Groups',
    icon: 'Users',
    accent: 'emerald',
    content: `Hey Maplewood neighbors! 👋

A wonderful family home just came on the market right here on Oak Street — and I wanted to share it with our community first before it hits the wider market.

The current owners raised their kids here over the past 18 years. It's three blocks from Lincoln Elementary, a five-minute walk to the Saturday farmer's market, and right across from the new community garden.

If you know a friend or family member who's been hoping to put down roots in our neighborhood, send them my way. I'd love to help them call Maplewood home. 💚

Drop a comment or DM me — happy to answer any questions!`
  }
];

// Future-friendly: when you wire up the LLM, return an array matching this shape
// from your API route and feed it into <ResultsGrid /> via props.
