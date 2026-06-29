export default function AuthDivider({ label = 'o' }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-wana-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-wana-cream px-3 text-wana-muted">{label}</span>
      </div>
    </div>
  );
}
