export default function ExclusiveBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`wana-premium-badge ${className}`}>
      <span aria-hidden>✦</span>
      Experiencia exclusiva
    </span>
  );
}
