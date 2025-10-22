'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#fafaf9',
        color: '#18181b',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#dc2626',
          margin: '0 0 1rem 0',
        }}
      >
        Something went wrong!
      </h2>
      <p
        style={{
          fontSize: '1.125rem',
          color: '#52525b',
          margin: '0 0 2rem 0',
          textAlign: 'center',
          maxWidth: '28rem',
        }}
      >
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
            cursor: 'pointer',
            fontSize: '1rem',
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
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
}