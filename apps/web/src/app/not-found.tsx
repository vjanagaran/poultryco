export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | PoultryCo</title>
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
            color: '#16a34a', 
            marginBottom: '1rem',
            margin: '0 0 1rem 0'
          }}>404</h1>
          <p style={{ 
            fontSize: '1.5rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>Page Not Found</p>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#52525b', 
            marginBottom: '2rem',
            textAlign: 'center',
            maxWidth: '28rem',
            margin: '0 0 2rem 0'
          }}>
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
              transition: 'background 0.2s'
            }}
          >
            Go to Homepage
          </a>
        </div>
      </body>
    </html>
  )
}

