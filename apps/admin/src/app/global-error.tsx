'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p>{error.message || 'An error occurred'}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  )
}

