import { Suspense } from 'react';
import AuthPageFallback from '@/components/auth/AuthPageFallback';
import LoginPage from './LoginClient';

export default function Page() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <LoginPage />
    </Suspense>
  );
}
