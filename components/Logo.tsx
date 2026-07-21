import Link from 'next/link';
import EleveriMark from '@/components/brand/EleveriMark';

type LogoProps = {
  compact?: boolean;
  /** Fondo oscuro (header/footer): wordmark blanco */
  onDark?: boolean;
};

export default function Logo({ compact = false, onDark = true }: LogoProps) {
  const wordColor = onDark ? 'text-white' : 'text-wana-charcoal';
  const subColor = onDark ? 'text-wana-champagne/90' : 'text-wana-muted';

  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
      aria-label="Eleveri — inicio"
    >
      <span className="relative shrink-0 transition-transform duration-200 group-hover:scale-[1.03]">
        <EleveriMark className={compact ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-9 sm:h-10 sm:w-10'} />
      </span>
      {!compact && (
        <span className="min-w-0 leading-none">
          <span
            className={`block font-sans text-[1.25rem] font-semibold tracking-[-0.04em] sm:text-[1.35rem] ${wordColor}`}
          >
            eleveri
          </span>
          <span
            className={`mt-1 hidden text-[10px] font-medium uppercase tracking-[0.22em] sm:block ${subColor}`}
          >
            Glamping
          </span>
        </span>
      )}
    </Link>
  );
}
