'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { wanaApi, type AdminPropertyRow, type PropertyStatus } from '@/lib/api-client';

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  unavailable: 'No disponible',
  maintenance: 'Mantenimiento',
};

export default function AdminPropertiesPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminPropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    wanaApi
      .adminProperties()
      .then((r) => setRows(r.data))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (id: string, status: PropertyStatus) => {
    setBusyId(id);
    try {
      await wanaApi.adminUpdatePropertyStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success('Estado actualizado');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-slate-500">Cargando propiedades…</p>;

  return (
    <div className="wana-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-wana-sand/50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Sin propiedades
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                  <td className="px-4 py-3 text-slate-600">{row.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-wana-sand px-3 py-1 text-xs font-medium">
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.host_email}</td>
                  <td className="px-4 py-3">
                    {row.status === 'draft' && (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => updateStatus(row.id, 'published')}
                        className="wana-btn-primary !px-4 !py-2 text-xs"
                      >
                        Publicar
                      </button>
                    )}
                    {row.status === 'published' && (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => updateStatus(row.id, 'unavailable')}
                        className="wana-btn-ghost !px-4 !py-2 text-xs"
                      >
                        Ocultar
                      </button>
                    )}
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
