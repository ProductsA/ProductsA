export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse">
      <div className="h-10 bg-muted rounded-2xl w-1/3 mb-3" />
      <div className="h-4 bg-muted rounded-xl w-1/4 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded-xl w-3/4" />
              <div className="h-3 bg-muted rounded-xl w-1/2" />
              <div className="h-8 bg-muted rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
