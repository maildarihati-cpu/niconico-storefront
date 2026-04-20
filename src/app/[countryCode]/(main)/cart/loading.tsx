export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto p-6 bg-white">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-12">
        <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
        <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-10" />
      </div>

      <div className="w-40 h-8 bg-gray-100 mx-auto mb-10 rounded-xl animate-pulse" />

      {/* Items Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-50 h-36 rounded-[32px] animate-pulse flex p-4 gap-4 border border-gray-100">
            <div className="w-28 h-full bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="w-3/4 h-5 bg-gray-200 rounded-md" />
              <div className="w-1/2 h-5 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="fixed bottom-8 left-6 right-6 max-w-md mx-auto">
        <div className="bg-gray-100 h-72 rounded-[48px] animate-pulse shadow-sm" />
      </div>
    </div>
  )
}