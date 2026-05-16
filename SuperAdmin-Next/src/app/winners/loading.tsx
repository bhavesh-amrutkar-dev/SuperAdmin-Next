export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col animate-pulse">
      {/* Header Placeholder */}
      <div className="bg-gray-900 py-16 text-center">
        <div className="h-8 w-48 bg-gray-700 mx-auto rounded mb-4"></div>
        <div className="h-4 w-64 bg-gray-700 mx-auto rounded"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="mx-auto w-full max-w-[1648px] px-4 md:px-6 pt-10 pb-10 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-4 space-y-4"
            >
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}