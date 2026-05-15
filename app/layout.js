import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'PropSocial AI — Social copy for real estate agents',
  description:
    'Turn one property video or listing into 3 scroll-stopping social posts: Professional, High-Energy, and Local-Community.',
  themeColor: '#020617'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
