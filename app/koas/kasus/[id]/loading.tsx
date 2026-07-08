export default function DetailKasusLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-64 max-w-full rounded bg-muted" />
        </div>
      </div>
      <div className="h-20 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted" />
          ))}
        </div>
        <div>
          <div className="h-96 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
