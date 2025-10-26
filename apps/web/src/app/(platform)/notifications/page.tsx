export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h1>
          <p className="text-sm text-gray-600">Stay updated with your activity</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No notifications yet</h2>
          <p className="text-sm text-gray-500 mb-4">
            You&apos;ll see notifications here when someone likes your posts, comments, or sends you a message
          </p>
          <p className="text-xs text-gray-400">
            Schema: <code className="bg-gray-100 px-2 py-1 rounded">notifications</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">notification_preferences</code>
          </p>
        </div>
      </div>
    </div>
  );
}
