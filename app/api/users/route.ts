import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/users - List users (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    let query = supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, avatar_url, created_at')
      .order('full_name', { ascending: true });

    // Filter by role (useful for getting staff list)
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
