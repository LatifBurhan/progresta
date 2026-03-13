export default function AdminUsersLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>

        {/* Pending Users Skeleton */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse"></div>
            <div className="h-6 bg-yellow-200 rounded-lg w-48 animate-pulse"></div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-28 mb-3 animate-pulse"></div>
                <div className="h-8 bg-green-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* All Users Skeleton */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
            </div>
            
            {/* Search and Filter Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}