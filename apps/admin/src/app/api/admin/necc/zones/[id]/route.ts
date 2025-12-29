import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/necc/zones/[id] - Update zone
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data = await apiClient.patch(`/necc/zones/${id}`, body);
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

    await apiClient.delete(`/necc/zones/${id}`);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete zone';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

