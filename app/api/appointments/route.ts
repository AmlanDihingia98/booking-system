import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateAppointmentDTO, ApiResponse, Appointment } from '@/lib/types/database';

// GET /api/appointments - List appointments (with filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const staffId = searchParams.get('staff_id');

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        staff:profiles!appointments_staff_id_fkey(*),
        service:services(*),
        payment:payments(*)
      `)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('appointment_date', startDate);
    }
    if (endDate) {
      query = query.lte('appointment_date', endDate);
    }
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
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

    const body: CreateAppointmentDTO = await request.json();
    const { staff_id, service_id, appointment_date, start_time, patient_notes } = body;

    // Validate required fields
    if (!staff_id || !service_id || !appointment_date || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get service details to calculate end time
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate end time
    const startDateTime = new Date(`${appointment_date}T${start_time}`);
    const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
    const end_time = endDateTime.toTimeString().slice(0, 5);

    // Check if staff is available (using the database function)
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('is_staff_available', {
        p_staff_id: staff_id,
        p_date: appointment_date,
        p_start_time: start_time,
        p_end_time: end_time
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Staff is not available at the selected time' },
        { status: 409 }
      );
    }

    // Create the appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        staff_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        patient_notes,
        status: 'pending'
      })
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        staff:profiles!appointments_staff_id_fkey(*),
        service:services(*)
      `)
      .single();

    if (createError) {
      console.error('Error creating appointment:', createError);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: appointment,
        message: 'Appointment created successfully'
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
