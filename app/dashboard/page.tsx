'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Calendar from '../components/Calendar';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'staff' | 'admin';
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  service: {
    name: string;
    duration_minutes: number;
  };
  staff: {
    full_name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
  }, []);

  const fetchProfile = async () => {
    try {
      // Use client-side Supabase directly
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      console.log('Checking session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('Session:', session);
      console.log('Session error:', sessionError);

      if (!session) {
        console.log('No session found, redirecting to login');
        setTimeout(() => router.push('/auth/login'), 100);
        return;
      }

      console.log('Fetching profile for user:', session.user.id);

      // Fetch profile directly from Supabase
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Profile data:', profileData);
      console.log('Profile error:', error);

      // If profile doesn't exist, create it
      if (!profileData || (error && error.code === 'PGRST116')) {
        console.log('Profile not found, creating new profile...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.email!,
            role: 'patient'
          })
          .select()
          .single();

        console.log('New profile:', newProfile);
        console.log('Insert error:', insertError);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          alert('Error creating profile: ' + JSON.stringify(insertError));
          return;
        }

        profileData = newProfile;
      } else if (error) {
        console.error('Error fetching profile:', error);
        alert('Error loading profile: ' + JSON.stringify(error));
        return;
      }

      console.log('Setting profile:', profileData);

      // Redirect based on user role
      if (profileData.role === 'staff') {
        router.push('/staff/dashboard');
        return;
      }

      if (profileData.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Unexpected error: ' + JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      // Fetch appointments directly from Supabase
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*),
          staff:profiles!appointments_staff_id_fkey(*),
          service:services(*)
        `)
        .or(`patient_id.eq.${session.user.id},staff_id.eq.${session.user.id}`)
        .order('appointment_date', { ascending: true });

      if (!error && appointmentsData) {
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out');
        return;
      }

      // Redirect to login page
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
              PhysioBook
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <Link href="/book" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Book Appointment
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {profile?.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{profile ? getFirstName(profile.full_name) : 'User'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200/50">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {profile?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{profile ? getFirstName(profile.full_name) : 'User'}</div>
                  <div className="text-xs text-gray-600">{profile?.email}</div>
                </div>
              </div>
              <Link
                href="/services"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/book"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                disabled={signingOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg shadow-blue-500/20">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Welcome back, {profile ? getFirstName(profile.full_name) : 'User'}!
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Manage your appointments and book new sessions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/book"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a new session</p>
              </div>
            </div>
          </Link>

          <Link
            href="/services"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View Services</h3>
                <p className="text-sm text-gray-600">Browse available services</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {appointments.length > 0 && (
          <div className="mb-8">
            <Calendar appointments={appointments} userRole={profile?.role} />
          </div>
        )}

        {/* Appointments Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No appointments yet</p>
              <Link
                href="/book"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        with {appointment.staff.full_name}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        {appointment.start_time} - {appointment.end_time}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
