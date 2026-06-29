'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '../lib/schema';
import { createProperty } from '../actions/property-actions';

export default function PropertyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(propertySchema)
  });

  const onSubmit = async (data: any) => {
    const result = await createProperty(data);
    if (result?.error) alert(result.error);
    else alert("Sanctuary published for moderation!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8 rounded-[32px] backdrop-blur-[20px] bg-[#1B4332]/80 border border-white/10 shadow-xl max-w-2xl mx-auto">
      <h2 className="text-[32px] font-playfair text-[#FDFBF7] mb-6">Load Property</h2>
      <label className="block mb-4">
        <input
          {...register("title")}
          placeholder="Title"
          className="w-full p-4 rounded-xl bg-white/10 text-[#FDFBF7]"
        />
        {errors.title && <p className="mt-2 text-sm text-red-300">{errors.title.message}</p>}
      </label>

      <label className="block mb-4">
        <textarea
          {...register("description")}
          placeholder="Describe your sanctuary (min 400 chars)..."
          className="w-full p-4 h-40 rounded-xl bg-white/10 text-[#FDFBF7]"
        />
        {errors.description && <p className="mt-2 text-sm text-red-300">{errors.description.message}</p>}
      </label>

      <label className="block mb-4">
        <input
          {...register("price_per_night", { valueAsNumber: true })}
          type="number"
          step="0.01"
          placeholder="Price per night"
          className="w-full p-4 rounded-xl bg-white/10 text-[#FDFBF7]"
        />
        {errors.price_per_night && <p className="mt-2 text-sm text-red-300">{errors.price_per_night.message}</p>}
      </label>

      <button type="submit" className="w-full py-4 bg-[#D4AF37] text-[#1B4332] font-bold rounded-xl">Publish Sanctuary</button>
    </form>
  );
}
