import Link from 'next/link';

type LogoProps = {
  compact?: boolean;
  /** Header oscuro: wordmark claro sobre midnight */
  onDark?: boolean;
};

export default function Logo({ compact = false, onDark = true }: LogoProps) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Waná Glamping — inicio">
      <span
        className={`relative flex items-center justify-center rounded-xl font-display shadow-wana transition group-hover:shadow-wana-lg ${
          compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'
        } ${
          onDark
            ? 'bg-gradient-to-br from-wana-accent-deep to-wana-accent text-white'
            : 'bg-gradient-to-br from-wana-forest to-wana-forest-light text-white'
        }`}
      >
        <span
          className={`absolute inset-0 rounded-xl ring-1 ring-inset ${
            onDark ? 'ring-wana-gold/45' : 'ring-wana-gold/30'
          }`}
          aria-hidden
        />
        W
      </span>
      {!compact && (
        <div className="leading-tight">
          <p
            className={`font-display text-xl tracking-tight ${
              onDark ? 'text-white' : 'text-wana-charcoal'
            }`}
          >
            Waná
          </p>
          <p
            className={`text-[9px] font-bold uppercase tracking-[0.28em] ${
              onDark ? 'text-wana-gold-light' : 'text-wana-gold'
            }`}
          >
            Glamping
          </p>
        </div>
      )}
    </Link>
  );
}
