'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function BookingModal({ isOpen, onClose, domo }: { isOpen: boolean, onClose: () => void, domo: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(1);

  const handleConfirmReservation = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Get actual user email and name from auth session
      const guestEmail = 'guest@example.com';
      const guestName = 'Guest User';

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN || ''}`,
        },
        body: JSON.stringify({
          propertyId: domo.id,
          days,
          guestEmail,
          guestName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process booking');
      }

      alert(`✅ Booking confirmed!\nTransaction ID: ${data.transactionId}\nEmail confirmation sent.`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nightly = domo.precio_por_noche;
  const subtotal = nightly * days;
  const inc_tax = subtotal * 0.08;
  const parafiscal = subtotal * 0.0025;
  const commission = subtotal * 0.15;
  const total = subtotal + inc_tax + parafiscal + commission;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          transition={{ ease: [0.23, 1, 0.32, 1], duration: 0.5 }}
          className="w-full max-w-lg p-8 rounded-[32px] bg-[#1B4332]/90 border border-white/10 backdrop-blur-[20px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-serif text-4xl text-[#FDFBF7] mb-6">Reservar {domo.nombre}</h2>
          
          {/* Days selector */}
          <div className="mb-6">
            <label className="block text-[#FDFBF7]/80 text-sm mb-2">Número de noches</label>
            <input 
              type="number" 
              min="1" 
              max="30"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Fee breakdown */}
          <div className="space-y-3 text-[#FDFBF7]/80 text-sm mb-6">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Tarifa noche: ${nightly.toLocaleString()}</span>
              <span className="font-bold text-right">×{days}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Subtotal</span>
              <span className="font-bold">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>INC (8%)</span>
              <span>${inc_tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Parafiscal (0.25%)</span>
              <span>${parafiscal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span>Comisión Waná (15%)</span>
              <span>${commission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 text-lg">
              <span className="text-[#D4AF37] font-bold">Total a pagar</span>
              <span className="text-[#D4AF37] font-bold">${total.toLocaleString()}</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button 
            onClick={handleConfirmReservation}
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#D4AF37] text-[#1B4332] font-bold text-lg hover:bg-[#FDFBF7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
