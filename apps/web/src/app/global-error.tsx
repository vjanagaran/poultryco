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
          <h1 style={{ 
            fontSize: '6rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>Error</h1>
          <p style={{ 
            fontSize: '1.5rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>A global error occurred!</p>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#52525b', 
            marginBottom: '2rem',
            textAlign: 'center',
            maxWidth: '28rem',
            margin: '0 0 2rem 0'
          }}>
            {error.message}
          </p>
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
        </div>
      </body>
    </html>
  )
}

