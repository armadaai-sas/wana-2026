export default function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse rounded-[32px] border border-wana-border bg-white/90 p-6 shadow-sm">
      <div className="h-10 w-1/3 rounded-2xl bg-wana-sand" />
      <div className="space-y-3">
        <div className="h-6 rounded-2xl bg-wana-sand" />
        <div className="h-6 rounded-2xl bg-wana-sand" />
        <div className="h-6 rounded-2xl bg-wana-sand" />
      </div>
      <div className="h-48 rounded-[28px] bg-wana-sand" />
    </div>
  );
}
