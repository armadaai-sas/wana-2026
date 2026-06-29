import { Suspense } from 'react';
import LoginPage from './LoginClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="wana-auth-page flex min-h-screen items-center justify-center">
          <p className="text-white/70">Cargando…</p>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
