import { NextResponse } from 'next/server';

/**
 * Cron endpoint to trigger NECC price scraper
 * Called by Vercel Cron every 15 minutes
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Call Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/scrape-necc-prices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
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

