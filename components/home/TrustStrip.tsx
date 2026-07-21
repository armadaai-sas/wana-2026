const items = [
  { label: 'Espacios curados', detail: 'Selección manual' },
  { label: 'Precio transparente', detail: 'Total antes de pagar' },
  { label: 'Reserva segura', detail: 'Confirmación clara' },
  { label: 'Soporte en español', detail: 'Huéspedes y anfitriones' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-wana-border/80 bg-wana-cream">
      <div className="wana-container py-6 sm:py-8">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {items.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-wana-border/80 bg-white/80 px-3 py-4 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-4"
            >
              <p className="text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-wana-charcoal sm:text-xs sm:tracking-[0.15em]">
                {item.label}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-wana-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
