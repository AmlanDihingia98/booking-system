import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateServiceDTO } from '@/lib/types/database';

// GET /api/services - List all services
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';

    let query = supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: services, error } = await query;

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: services });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service (Admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create services' },
        { status: 403 }
      );
    }

    const body: CreateServiceDTO = await request.json();
    const { name, description, duration_minutes, price, currency = 'USD' } = body;

    // Validate required fields
    if (!name || !duration_minutes || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (duration_minutes <= 0 || price < 0) {
      return NextResponse.json(
        { error: 'Invalid duration or price' },
        { status: 400 }
      );
    }

    const { data: service, error: createError } = await supabase
      .from('services')
      .insert({
        name,
        description,
        duration_minutes,
        price,
        currency,
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating service:', createError);
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: service,
        message: 'Service created successfully'
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
