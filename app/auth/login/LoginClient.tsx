'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';
import AuthShell from '@/components/auth/AuthShell';

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const GOOGLE_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

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
    <AuthShell
      title="Tu próximo refugio te espera"
      subtitle="Accede para reservar experiencias curadas en Sutatausa, Cucunubá y la sabana de Bogotá."
    >
      <p className="wana-eyebrow">Bienvenido</p>
      <h1 className="mt-2 font-display text-3xl text-wana-charcoal">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-wana-muted">Reserva con la confianza de una plataforma internacional.</p>

      {(GOOGLE_ENABLED || TURNSTILE_ENABLED) && (
        <div className="mt-6 space-y-4">
          <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
          {GOOGLE_ENABLED && <GoogleSignInButton onCredential={handleGoogle} text="signin_with" />}
        </div>
      )}

      {GOOGLE_ENABLED && <AuthDivider label="o con email" />}

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="wana-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="wana-input"
            autoComplete="email"
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="wana-label">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="wana-input"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="wana-btn-primary w-full min-h-[48px]">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/auth/forgot-password" className="wana-link font-medium">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-wana-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="wana-link">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
