export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-surface-2" />
      <div className="h-4 w-32 rounded bg-surface-2" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <div className="h-3 w-24 rounded bg-surface-2" />
            <div className="h-8 w-16 rounded bg-surface-2" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-full rounded bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
