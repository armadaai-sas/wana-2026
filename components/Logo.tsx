import Link from 'next/link';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-wana-forest to-wana-forest-light font-display text-white shadow-wana transition group-hover:shadow-wana-lg ${
          compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'
        }`}
      >
        <span
          className="absolute inset-0 rounded-xl ring-1 ring-inset ring-wana-gold/30"
          aria-hidden
        />
        W
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-xl text-wana-charcoal">Waná</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-wana-gold">
            Glamping
          </p>
        </div>
      )}
    </Link>
  );
}
