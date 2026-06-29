'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const afterAuth = (user: { role: string }) => {
    if (user.role === 'host') router.push('/host');
    else if (user.role === 'admin') router.push('/admin');
    else router.push(redirect);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Completa la verificación de seguridad');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password, turnstileToken || undefined);
      afterAuth(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Completa la verificación de seguridad antes de Google');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle(credential, { turnstile_token: turnstileToken || undefined });
      afterAuth(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header sticky={false} />
      <main className="wana-container flex min-h-[70vh] items-center justify-center py-12">
        <div className="wana-card w-full max-w-md p-8 shadow-wana-lg">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-wana-forest">Bienvenido</p>
          <h1 className="mt-1 font-display text-3xl text-slate-900">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-600">Reserva experiencias exclusivas en Colombia.</p>

          <div className="mt-6 space-y-4">
            <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
            <GoogleSignInButton onCredential={handleGoogle} text="signin_with" />
          </div>

          <AuthDivider label="o con email" />

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest focus:ring-2 focus:ring-wana-forest/10"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest focus:ring-2 focus:ring-wana-forest/10"
                required
              />
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="wana-btn-primary w-full min-h-[44px] !rounded-xl"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/auth/forgot-password" className="text-wana-forest hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="font-medium text-wana-forest hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
