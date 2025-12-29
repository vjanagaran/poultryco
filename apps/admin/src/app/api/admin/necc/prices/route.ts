import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

// POST /api/admin/necc/prices - Create manual price
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.zone_id || !body.date) {
      return NextResponse.json(
        { error: 'zone_id and date are required' },
        { status: 400 }
      );
    }

    const data = await apiClient.post('/necc/prices', {
      ...body,
      source: 'manual',
      mode: 'MANUAL',
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create price';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

