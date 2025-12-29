import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

// GET /api/admin/necc/zones - List all zones
export async function GET() {
  try {
    const data = await apiClient.get('/necc/zones');
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch zones';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST /api/admin/necc/zones - Create new zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.zone_type) {
      return NextResponse.json(
        { error: 'Name, slug, and zone_type are required' },
        { status: 400 }
      );
    }

    const data = await apiClient.post('/necc/zones', body);
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create zone';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

