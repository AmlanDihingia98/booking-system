import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateStaffAvailabilityDTO } from '@/lib/types/database';

// GET /api/availability/[id] - Get specific availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: availability, error } = await supabase
      .from('staff_availability')
      .select(`
        *,
        staff:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: availability });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/availability/[id] - Update availability (Staff/Admin only)
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

    // Check if user is staff or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['staff', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only staff and admins can manage availability' },
        { status: 403 }
      );
    }

    // Get current availability to check ownership
    const { data: currentAvailability } = await supabase
      .from('staff_availability')
      .select('staff_id')
      .eq('id', id)
      .single();

    if (!currentAvailability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    // Validate that staff can only update their own availability (unless admin)
    if (profile.role !== 'admin' && currentAvailability.staff_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only manage your own availability' },
        { status: 403 }
      );
    }

    const body: UpdateStaffAvailabilityDTO = await request.json();

    // Validate time range if both times are provided
    if (body.start_time && body.end_time && body.start_time >= body.end_time) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const { data: availability, error: updateError } = await supabase
      .from('staff_availability')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        staff:profiles(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating availability:', updateError);
      return NextResponse.json(
        { error: 'Failed to update availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/availability/[id] - Delete availability (Staff/Admin only)
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

    // Check if user is staff or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['staff', 'admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only staff and admins can manage availability' },
        { status: 403 }
      );
    }

    // Get current availability to check ownership
    const { data: currentAvailability } = await supabase
      .from('staff_availability')
      .select('staff_id')
      .eq('id', id)
      .single();

    if (!currentAvailability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    // Validate that staff can only delete their own availability (unless admin)
    if (profile.role !== 'admin' && currentAvailability.staff_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only manage your own availability' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('staff_availability')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability:', error);
      return NextResponse.json(
        { error: 'Failed to delete availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
