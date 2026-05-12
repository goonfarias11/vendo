// src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 bg-surface rounded-xl w-48 mb-2" />
        <div className="h-4 bg-surface rounded-lg w-64" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 space-y-3">
            <div className="h-3 bg-surface rounded w-20" />
            <div className="h-8 bg-surface rounded-xl w-24" />
            <div className="h-3 bg-surface rounded w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
          <div className="h-4 bg-surface rounded w-32" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 items-center py-2 border-b border-border">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-surface rounded w-32" />
                <div className="h-3 bg-surface rounded w-48" />
              </div>
              <div className="h-3.5 bg-surface rounded w-16" />
              <div className="h-5 bg-surface rounded-full w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-border rounded-2xl p-6 space-y-3">
          <div className="h-4 bg-surface rounded w-24" />
          <div className="h-16 bg-surface rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-surface rounded-xl" />
            <div className="h-8 bg-surface rounded-xl" />
          </div>
          <div className="h-16 bg-surface rounded-xl" />
        </div>
      </div>
    </div>
  );
}
