import Header from '@/components/Header';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">{children}</main>
    </>
  );
}
