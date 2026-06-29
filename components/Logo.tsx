import Link from 'next/link';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-xl bg-wana-forest font-display text-white shadow-wana transition group-hover:bg-wana-forest-light ${
          compact ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-xl'
        }`}
      >
        W
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-xl text-slate-900">Waná</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Glamping
          </p>
        </div>
      )}
    </Link>
  );
}
