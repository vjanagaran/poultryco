'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4">
          <h1 className="text-6xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-2xl font-medium mb-2">A global error occurred!</p>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
            {error.message}
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

