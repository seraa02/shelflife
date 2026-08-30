export function ProductCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-56 bg-gray-200" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
