import { NextRequest, NextResponse } from 'next/server';
import { getPricesByDateRange } from '@/lib/api/necc-prices';
import { getZoneById } from '@/lib/api/necc-zones';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zonesParam = searchParams.get('zones');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!zonesParam || !start || !end) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const zoneIds = zonesParam.split(',');
    
    // Fetch zone details
    const zones = await Promise.all(
      zoneIds.map(id => getZoneById(id))
    );

    // Fetch prices for date range
    const prices = await getPricesByDateRange(start, end);

    // Group by date
    const pricesByDate = new Map<string, { [zoneName: string]: number }>();

    prices.forEach(price => {
      const zone = zones.find(z => z?.id === price.zone_id);
      if (!zone || price.suggested_price === null) return;

      if (!pricesByDate.has(price.date)) {
        pricesByDate.set(price.date, {});
      }

      const dayData = pricesByDate.get(price.date)!;
      dayData[zone.name] = price.suggested_price;
    });

    // Convert to array format for chart
    const chartData = Array.from(pricesByDate.entries())
      .map(([date, prices]) => ({
        date,
        ...prices,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
  }
}

