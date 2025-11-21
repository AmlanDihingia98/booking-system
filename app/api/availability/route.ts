import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateStaffAvailabilityDTO } from '@/lib/types/database';

// GET /api/availability - List staff availability
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staff_id');
    const dayOfWeek = searchParams.get('day_of_week');

    let query = supabase
      .from('staff_availability')
      .select(`
        *,
        staff:profiles(*)
      `)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (dayOfWeek) {
      query = query.eq('day_of_week', dayOfWeek);
    }

    const { data: availability, error } = await query;

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
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

// POST /api/availability - Create staff availability (Staff/Admin only)
export async function POST(request: NextRequest) {
  try {
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

    const body: CreateStaffAvailabilityDTO = await request.json();
    const { staff_id, day_of_week, start_time, end_time } = body;

    // Validate required fields
    if (!staff_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that staff can only create their own availability (unless admin)
    if (profile.role !== 'admin' && staff_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only manage your own availability' },
        { status: 403 }
      );
    }

    // Validate time range
    if (start_time >= end_time) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const { data: availability, error: createError } = await supabase
      .from('staff_availability')
      .insert({
        staff_id,
        day_of_week,
        start_time,
        end_time,
        is_available: true
      })
      .select(`
        *,
        staff:profiles(*)
      `)
      .single();

    if (createError) {
      console.error('Error creating availability:', createError);
      return NextResponse.json(
        { error: 'Failed to create availability' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: availability,
        message: 'Availability created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
