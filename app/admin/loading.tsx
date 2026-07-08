export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 rounded-lg bg-muted" />
        <div className="h-11 w-full rounded-lg bg-muted sm:w-40" />
        <div className="h-11 w-full rounded-lg bg-muted sm:w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
