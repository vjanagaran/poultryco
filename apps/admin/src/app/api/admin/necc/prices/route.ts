import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/necc/prices - Create manual price
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.zone_id || !body.date) {
      return NextResponse.json(
        { error: 'zone_id and date are required' },
        { status: 400 }
      );
    }

    // Check if price already exists
    const { data: existing } = await supabase
      .from('necc_prices')
      .select('id')
      .eq('zone_id', body.zone_id)
      .eq('date', body.date)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Price for this zone and date already exists' },
        { status: 409 }
      );
    }

    // Parse date to extract year, month, day
    const date = new Date(body.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day_of_month = date.getDate();

    const { data, error } = await supabase
      .from('necc_prices')
      .insert({
        zone_id: body.zone_id,
        date: body.date,
        year,
        month,
        day_of_month,
        suggested_price: body.suggested_price || null,
        prevailing_price: body.prevailing_price || null,
        source: 'manual',
        mode: 'MANUAL',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create price';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

