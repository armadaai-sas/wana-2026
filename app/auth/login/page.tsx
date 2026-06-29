import { Suspense } from 'react';
import LoginPage from './LoginClient';

export default function Page() {
  return (
    <Suspense fallback={<p className="wana-container py-20 text-slate-500">Cargando…</p>}>
      <LoginPage />
    </Suspense>
  );
}
