export default function AuthDivider({ label = 'o' }: { label?: string }) {
  return (
    <div className="wana-auth-divider" role="separator" aria-label={label}>
      <span className="wana-auth-divider-label">{label}</span>
    </div>
  );
}
