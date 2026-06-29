import Header from '@/components/Header';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-wana-forest">Administración</p>
          <h1 className="mt-1 font-display text-3xl text-slate-900">Panel operativo</h1>
        </header>
        <div className="mb-8">
          <AdminNav />
        </div>
        {children}
      </main>
    </>
  );
}
