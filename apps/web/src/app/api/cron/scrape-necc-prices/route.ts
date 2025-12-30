import { NextResponse } from 'next/server';

/**
 * Cron endpoint to trigger NECC price scraper
 * Can be called by external cron service (e.g., AWS EventBridge, cron-job.org)
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1';
    
    // Call REST API scraper endpoint
    const response = await fetch(`${apiUrl}/necc/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

