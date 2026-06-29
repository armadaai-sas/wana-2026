export default function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="h-10 w-1/3 rounded-2xl bg-slate-200" />
      <div className="grid gap-4">
        <div className="h-6 rounded-2xl bg-slate-200" />
        <div className="h-6 rounded-2xl bg-slate-200" />
        <div className="h-6 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-48 rounded-[28px] bg-slate-200" />
    </div>
  );
}
