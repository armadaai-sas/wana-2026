import Link from 'next/link';

const pillars = [
  {
    title: 'Espacios curados',
    desc: 'Cada refugio pasa revisión de calidad y experiencia.',
    icon: '✦',
  },
  {
    title: 'Precio transparente',
    desc: 'Total visible antes de pagar, sin sorpresas.',
    icon: '◎',
  },
  {
    title: 'Reserva segura',
    desc: 'Confirmación clara y soporte en español.',
    icon: '♥',
  },
];

export default function ExperiencePillars() {
  return (
    <section className="wana-container py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-wana-forest">Por qué Waná</p>
        <h2 className="mt-3 font-display text-2xl text-slate-900 sm:text-3xl">
          Más que un alojamiento, una experiencia
        </h2>
        <p className="mt-3 text-slate-600">
          Glamping y refugios seleccionados con el cuidado de un anfitrión, no de un marketplace masivo.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {pillars.map((p, i) => (
          <div
            key={p.title}
            className="wana-card group p-6 transition hover:shadow-wana-lg animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wana-sand text-lg text-wana-forest transition group-hover:bg-wana-forest group-hover:text-white">
              {p.icon}
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/properties" className="wana-btn-primary inline-flex min-h-[44px]">
          Explorar colección
        </Link>
      </div>
    </section>
  );
}
