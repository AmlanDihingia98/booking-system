import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UpdateProfileDTO } from '@/lib/types/database';

// POST /api/profile - Create a new profile (for signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, full_name, role = 'patient' } = body;

    if (!id || !email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id,
        email,
        full_name,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: profile,
      message: 'Profile created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/profile - Get current user's profile
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateProfileDTO = await request.json();

    // Users cannot change their own role
    if ('role' in body) {
      delete (body as any).role;
    }

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
