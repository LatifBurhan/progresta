export default function ProfileLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
