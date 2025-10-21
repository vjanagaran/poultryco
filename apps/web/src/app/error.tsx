'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4">
          <h2 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h2>
          <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
            We apologize for the inconvenience. Please try again.
          </p>
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => reset()}
            >
              Try again
            </button>
            <Link 
              href="/" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

