import type { Metadata } from 'next';
import './globals.css';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer';
import MarketingScripts from '@/components/analytics/MarketingScripts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wana.co';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Waná — Glamping en Colombia', template: '%s | Waná' },
  description: 'Reserva experiencias de glamping únicas en Colombia. Naturaleza, confort y aventura.',
  openGraph: {
    siteName: 'Waná',
    locale: 'es_CO',
    type: 'website',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${dmSerif.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="wana-page-bg min-h-screen font-sans text-wana-charcoal antialiased">
        <MarketingScripts />
        {children}
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'text-sm font-medium',
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              background: '#FAF7F2',
              color: '#1A1F1C',
              border: '1px solid #E5E0D6',
            },
          }}
        />
      </body>
    </html>
  );
}
