const items = [
  { label: 'Espacios curados', detail: 'Selección manual' },
  { label: 'Precio transparente', detail: 'Total antes de pagar' },
  { label: 'Reserva segura', detail: 'Confirmación clara' },
  { label: 'Soporte en español', detail: 'Huéspedes y anfitriones' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-wana-border bg-wana-sand/35">
      <div className="wana-container py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center sm:gap-x-12">
          {items.map((item) => (
            <li key={item.label} className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-wana-charcoal">
                {item.label}
              </span>
              <span className="hidden text-wana-gold sm:inline" aria-hidden>·</span>
              <span className="text-xs text-wana-muted">{item.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
