'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { wanaApi } from '@/lib/api-client';
import { uploadPropertyMedia } from '@/lib/media-api';

const AMENITY_OPTIONS = ['WiFi', 'Agua caliente', 'Estacionamiento', 'Cocina', 'Vista', 'Pet friendly'];

export default function AddPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const toggleAmenity = (name: string) => {
    setAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const city = String(form.get('city') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const price = Number(form.get('price'));
    const maxGuests = Number(form.get('max_guests') ?? 2);

    try {
      const { property } = await wanaApi.createHostProperty({
        title,
        description,
        city,
        price_per_night: price,
        max_guests: maxGuests,
        amenities,
      });

      if (file) {
        await uploadPropertyMedia(property.id, file);
      }

      toast.success('Propiedad creada. Agrega más fotos si quieres.');
      router.push(`/host/properties/${property.id}/media`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear la propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wana-card space-y-6 p-6 sm:p-8">
      <div className="rounded-xl border border-wana-sand bg-wana-cream/80 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Guía de calidad</p>
        <p className="mt-1">
          Usa fotos bien iluminadas en alta resolución. Tu espacio quedará en borrador hasta que un
          administrador lo publique.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Título</span>
          <input
            name="title"
            required
            minLength={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-wana-forest"
            placeholder="Domo en el bosque"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Ciudad / zona</span>
          <input
            name="city"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-wana-forest"
            placeholder="Guatavita, Cundinamarca"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Descripción</span>
        <textarea
          name="description"
          required
          minLength={20}
          rows={5}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-wana-forest"
          placeholder="Describe la experiencia, acceso y lo que incluye la estadía…"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Precio por noche (COP)</span>
          <input
            name="price"
            type="number"
            min={1}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-wana-forest"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Huéspedes máx.</span>
          <input
            name="max_guests"
            type="number"
            min={1}
            max={20}
            defaultValue={2}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-wana-forest"
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Comodidades</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((name) => {
            const active = amenities.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleAmenity(name)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-wana-forest text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-wana-forest'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Foto o video destacado (opcional)</span>
        <input
          type="file"
          accept="image/jpeg,image/webp,image/png,video/mp4,video/quicktime"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
        />
      </label>

      <button type="submit" disabled={loading} className="wana-btn-primary w-full sm:w-auto min-h-[44px]">
        {loading ? 'Creando…' : 'Crear y subir media'}
      </button>
    </form>
  );
}
