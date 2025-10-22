export default function NotFound() {
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
      <h1
        style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          color: '#16a34a',
          margin: '0 0 1rem 0',
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: '500',
          margin: '0 0 0.5rem 0',
        }}
      >
        Page Not Found
      </p>
      <p
        style={{
          fontSize: '1.125rem',
          color: '#52525b',
          margin: '0 0 2rem 0',
          textAlign: 'center',
          maxWidth: '28rem',
        }}
      >
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <a
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          background: '#16a34a',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontWeight: '500',
          display: 'inline-block',
        }}
      >
        Go to Homepage
      </a>
    </div>
  )
}