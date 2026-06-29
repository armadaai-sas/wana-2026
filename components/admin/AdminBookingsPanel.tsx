'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { wanaApi, type AdminBookingRow } from '@/lib/api-client';

export default function AdminBookingsPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    wanaApi
      .adminBookings()
      .then((r) => setRows(r.data))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-slate-500">Cargando reservas…</p>;

  return (
    <div className="wana-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-wana-sand/50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Propiedad</th>
              <th className="px-4 py-3">Huésped</th>
              <th className="px-4 py-3">Fechas</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Sin reservas
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.property_title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.guest_name ?? row.guest_email}
                    <span className="block text-xs text-slate-400">{row.guests} huéspedes</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.check_in} → {row.check_out}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-wana-sand px-3 py-1 text-xs font-medium">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
