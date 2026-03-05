export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
        
        {/* Card Skeleton */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Skeleton */}
            <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
            
            {/* Text Skeletons */}
            <div className="space-y-3 w-full max-w-xs">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
