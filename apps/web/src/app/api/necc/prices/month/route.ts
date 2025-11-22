import { NextRequest, NextResponse } from 'next/server';
import { getMonthPrices } from '@/lib/api/necc-prices';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json({ error: 'Missing year or month' }, { status: 400 });
    }

    const prices = await getMonthPrices(parseInt(year), parseInt(month));
    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching month prices:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}

