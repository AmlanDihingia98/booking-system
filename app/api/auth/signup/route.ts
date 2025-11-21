import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/auth/signup - Create new user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, password, full_name, role = 'patient' } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full_name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: data.user,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
