import type { Metadata } from 'next';
import './globals.css';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import MarketingScripts from '@/components/analytics/MarketingScripts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://eleveri.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Eleveri — Glamping en Colombia', template: '%s | Eleveri' },
  description: 'Reserva experiencias de glamping únicas en Colombia. Naturaleza, confort y aventura.',
  openGraph: {
    siteName: 'Eleveri',
    locale: 'es_CO',
    type: 'website',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="wana-page-bg min-h-screen font-sans text-wana-charcoal antialiased">
        <MarketingScripts />
        {children}
        <ConditionalFooter />
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
            error: {
              style: {
                background: '#FFF8F0',
                color: '#7A4A00',
                border: '1px solid #F5D9A8',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
