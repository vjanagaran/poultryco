export default function SearchPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600 mb-4">Find members, businesses, products, and more</p>
          <p className="text-xs text-gray-400">
            Schema: Full-text search across <code className="bg-gray-100 px-2 py-1 rounded">profiles</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">business_profiles</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">products</code>
          </p>
        </div>
      </div>
    </div>
  );
}
