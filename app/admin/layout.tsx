import Header from '@/components/Header';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">
        <header className="mb-6">
          <p className="wana-eyebrow">Administración</p>
          <h1 className="mt-2 font-display text-3xl text-wana-charcoal">Panel operativo</h1>
        </header>
        <div className="mb-8">
          <AdminNav />
        </div>
        {children}
      </main>
    </>
  );
}
