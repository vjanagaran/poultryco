import Link from 'next/link'

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>404 - Page Not Found</h2>
          <p>The page you are looking for does not exist.</p>
          <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      </body>
    </html>
  )
}
