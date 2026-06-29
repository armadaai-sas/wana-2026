import Link from 'next/link';

type LogoProps = {
  compact?: boolean;
  /** Fondo oscuro (header/footer): wordmark blanco */
  onDark?: boolean;
};

export default function Logo({ compact = false, onDark = true }: LogoProps) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Waná Glamping — inicio">
      <span
        className={`relative flex items-center justify-center rounded-xl bg-wana-black font-display text-wana-champagne shadow-wana transition group-hover:shadow-wana-lg ring-1 ring-wana-champagne/40 group-hover:ring-wana-champagne/65 ${
          compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'
        }`}
      >
        W
      </span>
      {!compact && (
        <div className="leading-tight">
          <p
            className={`font-display text-xl tracking-tight ${
              onDark ? 'text-white' : 'text-wana-black'
            }`}
          >
            Waná
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-wana-champagne">
            Glamping
          </p>
        </div>
      )}
    </Link>
  );
}
