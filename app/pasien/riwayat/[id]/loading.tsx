export default function DetailSkriningLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-7 w-52 rounded-lg bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-8 rounded-2xl border border-border/50 bg-card p-6 md:p-8">
        <div className="h-16 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
