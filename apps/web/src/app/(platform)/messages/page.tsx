export default function MessagesPage() {
  return (
    <div className="container mx-auto py-8 h-[calc(100vh-200px)]">
      <div className="max-w-6xl mx-auto h-full">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600 mb-4">Real-time chat with your connections</p>
          <p className="text-xs text-gray-400">
            Schema: <code className="bg-gray-100 px-2 py-1 rounded">conversations</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">messages</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">message_read_status</code>
          </p>
        </div>
      </div>
    </div>
  );
}
