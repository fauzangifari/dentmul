export default function KoasLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 rounded-lg bg-muted" />
        <div className="h-11 w-full rounded-lg bg-muted sm:w-44" />
        <div className="h-11 w-full rounded-lg bg-muted sm:w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
