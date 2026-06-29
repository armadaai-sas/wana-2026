import { Suspense } from 'react';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-center text-wana-muted">Cargando…</div>}>{children}</Suspense>;
}
