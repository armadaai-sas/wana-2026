'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { wanaApi } from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Awaited<ReturnType<typeof wanaApi.listHostProperties>>['data']>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'host' && user.role !== 'admin')) return;
    wanaApi
      .listHostProperties()
      .then((r) => setProperties(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'));
  }, [user]);

  if (authLoading) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (!user) {
    return (
      <div className="wana-card p-8 text-center">
        <p className="text-slate-600">Inicia sesión como anfitrión para gestionar tus propiedades.</p>
        <Link href="/auth/login?redirect=/host" className="wana-btn-primary mt-6 inline-flex">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (user.role === 'guest') {
    return (
      <div className="wana-card p-8 text-center">
        <p className="text-slate-600">Tu cuenta es de huésped. Regístrate como anfitrión para publicar espacios.</p>
        <Link href="/auth/register" className="wana-btn-primary mt-6 inline-flex">
          Crear cuenta anfitrión
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {properties.length === 0 ? (
        <div className="wana-card p-8 text-center">
          <p className="text-slate-600">Aún no tienes propiedades publicadas.</p>
          <Link href="/host/add-property" className="wana-btn-primary mt-6 inline-flex min-h-[44px]">
            Publicar tu primer espacio
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/host/properties/${p.id}/media`}
              className="wana-card overflow-hidden transition hover:shadow-card"
            >
              <div className="aspect-[16/10] bg-wana-sand">
                {p.cover_image ? (
                  <img src={p.cover_image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">Sin foto</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-slate-900">{p.title}</h2>
                <p className="text-sm text-slate-500">{p.city ?? 'Colombia'}</p>
                <p className="mt-2 text-xs text-wana-forest">
                  {p.media_count} archivo{p.media_count !== 1 ? 's' : ''} · Gestionar →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
