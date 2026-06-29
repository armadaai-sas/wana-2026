'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';
import AuthShell from '@/components/auth/AuthShell';

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const GOOGLE_ENABLED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Completa la verificación de seguridad');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await register({
        email,
        password,
        name,
        role,
        turnstile_token: turnstileToken || undefined,
      });
      router.push(user.role === 'host' ? '/host' : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
      const user = await loginWithGoogle(credential, {
        turnstile_token: turnstileToken || undefined,
        role,
      });
      router.push(user.role === 'host' ? '/host' : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell layout="centered">
      <p className="wana-eyebrow">Registro</p>
      <h1 className="mt-2 font-display text-3xl text-wana-charcoal">Crear cuenta</h1>
      <p className="mt-2 text-sm text-wana-muted">Huésped o anfitrión — empieza en minutos.</p>

      {(GOOGLE_ENABLED || TURNSTILE_ENABLED) && (
        <div className="mt-6 space-y-4">
          <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
          {GOOGLE_ENABLED && <GoogleSignInButton onCredential={handleGoogle} text="signup_with" />}
        </div>
      )}

      {GOOGLE_ENABLED && <AuthDivider label="o con email" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="wana-label">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="wana-input"
            autoComplete="name"
            required
          />
        </label>
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
          <span className="wana-label">Contraseña (mín. 8)</span>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="wana-input"
            autoComplete="new-password"
            required
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="wana-label">Quiero</legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole('guest')}
              className={`wana-chip ${role === 'guest' ? 'wana-chip-active' : ''}`}
            >
              Reservar
            </button>
            <button
              type="button"
              onClick={() => setRole('host')}
              className={`wana-chip ${role === 'host' ? 'wana-chip-active' : ''}`}
            >
              Anfitrión
            </button>
          </div>
        </fieldset>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="wana-btn-primary w-full min-h-[48px]">
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-wana-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="wana-link">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
