'use client'

import { useEffect } from 'react'

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
      <head>
        <title>Error | PoultryCo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          background: '#fafaf9', 
          color: '#18181b',
          padding: '1rem'
        }}>
          <h2 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>Something went wrong!</h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#52525b', 
            marginBottom: '2rem',
            textAlign: 'center',
            maxWidth: '28rem',
            margin: '0 0 2rem 0'
          }}>
            We apologize for the inconvenience. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={() => reset()}
            >
              Try again
            </button>
            <a 
              href="/" 
              style={{
                padding: '0.75rem 1.5rem',
                background: '#16a34a',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}

