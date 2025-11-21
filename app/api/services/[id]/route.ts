import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateServiceDTO } from '@/lib/types/database';

// GET /api/services/[id] - Get a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching service:', error);
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: service });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/services/[id] - Update a service (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update services' },
        { status: 403 }
      );
    }

    const body: UpdateServiceDTO = await request.json();

    // Validate fields if provided
    if (body.duration_minutes !== undefined && body.duration_minutes <= 0) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      );
    }

    if (body.price !== undefined && body.price < 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    const { data: service, error: updateError } = await supabase
      .from('services')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating service:', updateError);
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete a service (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete services' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
