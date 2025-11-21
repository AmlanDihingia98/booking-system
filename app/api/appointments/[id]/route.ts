import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateAppointmentDTO } from '@/lib/types/database';

// GET /api/appointments/[id] - Get a specific appointment
export async function GET(
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

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        staff:profiles!appointments_staff_id_fkey(*),
        service:services(*),
        payment:payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: appointment });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/appointments/[id] - Update an appointment
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

    const body: UpdateAppointmentDTO = await request.json();

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, service:services(duration_minutes)')
      .eq('id', id)
      .single();

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // If updating time/date, check availability
    if (body.appointment_date || body.start_time) {
      const appointment_date = body.appointment_date || currentAppointment.appointment_date;
      const start_time = body.start_time || currentAppointment.start_time;

      // Calculate end time
      const startDateTime = new Date(`${appointment_date}T${start_time}`);
      const endDateTime = new Date(
        startDateTime.getTime() + currentAppointment.service.duration_minutes * 60000
      );
      const end_time = endDateTime.toTimeString().slice(0, 5);

      const { data: isAvailable, error: availabilityError } = await supabase
        .rpc('is_staff_available', {
          p_staff_id: currentAppointment.staff_id,
          p_date: appointment_date,
          p_start_time: start_time,
          p_end_time: end_time,
          p_exclude_appointment_id: id
        });

      if (availabilityError || !isAvailable) {
        return NextResponse.json(
          { error: 'Staff is not available at the selected time' },
          { status: 409 }
        );
      }

      body.end_time = end_time;
    }

    // Update the appointment
    const { data: appointment, error: updateError } = await supabase
      .from('appointments')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        staff:profiles!appointments_staff_id_fkey(*),
        service:services(*),
        payment:payments(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Delete an appointment
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
        { error: 'Only admins can delete appointments' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
