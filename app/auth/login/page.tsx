import { Suspense } from 'react';
import Header from '@/components/Header';
import LoginPage from './LoginClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <>
          <Header sticky={false} />
          <p className="wana-container py-20 text-center text-wana-muted">Cargando…</p>
        </>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
