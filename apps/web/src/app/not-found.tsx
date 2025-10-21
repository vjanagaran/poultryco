import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4">
          <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
          <p className="text-2xl font-medium mb-2">Page Not Found</p>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Go to Homepage
          </Link>
        </div>
      </body>
    </html>
  )
}

