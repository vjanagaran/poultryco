import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/necc/zones - List all zones
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('necc_zones')
      .select('*')
      .order('sorting', { ascending: true });

    if (error) throw error;

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
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.zone_type) {
      return NextResponse.json(
        { error: 'Name, slug, and zone_type are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name or slug
    const { data: existing } = await supabase
      .from('necc_zones')
      .select('id')
      .or(`name.eq.${body.name},slug.eq.${body.slug}`)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Zone with this name or slug already exists' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('necc_zones')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        zone_type: body.zone_type,
        zone_code: body.zone_code || null,
        state: body.state || null,
        district: body.district || null,
        city: body.city || null,
        sorting: body.sorting || 0,
        status: body.status ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create zone';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

