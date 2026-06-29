'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { wanaApi, type GuestBookingRow } from '@/lib/api-client';
import { formatCop } from '@/lib/format';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  draft: 'Borrador',
};

export default function GuestBookingsList() {
  const [rows, setRows] = useState<GuestBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    wanaApi
      .myBookings()
      .then((r) => setRows(r.data))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id: string) => {
    setBusyId(id);
    try {
      await wanaApi.cancelBooking(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
      toast.success('Reserva cancelada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cancelar');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="mt-6 text-slate-500">Cargando reservas…</p>;

  if (rows.length === 0) {
    return (
      <div className="mt-8 border-t border-slate-200 pt-8">
        <h2 className="font-display text-lg text-slate-900">Mis reservas</h2>
        <p className="mt-2 text-slate-600">Aún no tienes reservas.</p>
        <Link href="/properties" className="mt-4 inline-flex text-sm font-medium text-wana-forest hover:underline">
          Explorar espacios →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <h2 className="font-display text-lg text-slate-900">Mis reservas</h2>
      <ul className="mt-4 space-y-4">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link
                  href={`/properties/${row.property_slug}`}
                  className="font-semibold text-slate-900 hover:text-wana-forest"
                >
                  {row.property_title}
                </Link>
                <p className="text-sm text-slate-500">{row.property_city ?? 'Colombia'}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {row.check_in} → {row.check_out} · {row.guests} huéspedes
                </p>
                <span className="mt-2 inline-block rounded-full bg-wana-sand px-3 py-1 text-xs font-medium">
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
                {row.total != null && (
                  <p className="mt-2 text-sm font-medium text-slate-800">{formatCop(row.total)}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === 'pending_payment' && (
                  <>
                    <Link
                      href={`/checkout/${row.id}?property=${row.property_slug}`}
                      className="wana-btn-primary !px-4 !py-2 text-sm min-h-[44px]"
                    >
                      Pagar
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => cancel(row.id)}
                      className="wana-btn-ghost !px-4 !py-2 text-sm min-h-[44px]"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {row.status === 'confirmed' && (
                  <Link
                    href={`/checkout/${row.id}/success?property=${row.property_slug}`}
                    className="wana-btn-ghost !px-4 !py-2 text-sm min-h-[44px]"
                  >
                    Ver confirmación
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
