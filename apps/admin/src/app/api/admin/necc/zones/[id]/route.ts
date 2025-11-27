import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/necc/zones/[id] - Update zone
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = await request.json();

    // Check if zone exists
    const { data: existing } = await supabase
      .from('necc_zones')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('necc_zones')
      .update({
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
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update zone';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/necc/zones/[id] - Delete zone
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check if zone has prices
    const { count } = await supabase
      .from('necc_prices')
      .select('id', { count: 'exact', head: true })
      .eq('zone_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete zone with ${count} price records. Delete prices first.` },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('necc_zones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete zone';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

