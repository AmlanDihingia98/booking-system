'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Calendar from '@/app/components/Calendar';

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
  patient_notes: string | null;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
  paid_at?: string;
  refund_amount?: number;
  refunded_at?: string;
  service: {
    name: string;
    duration_minutes: number;
    price: number;
  };
  patient: {
    full_name: string;
    email: string;
  };
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profileData) {
        console.error('Error fetching profile:', error);
        router.push('/dashboard');
        return;
      }

      // Redirect non-staff users
      if (profileData.role !== 'staff' && profileData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setProfile(profileData);
      fetchAppointments(session.user.id);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (staffId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*),
          service:services(*)
        `)
        .eq('staff_id', staffId)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!error && appointmentsData) {
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId);
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update appointment status');
        return;
      }

      // Refresh appointments
      if (profile) {
        fetchAppointments(profile.id);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setUpdatingStatus(null);
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

  const getPaymentStatusColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'partially_refunded':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusLabel = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      case 'partially_refunded':
        return 'Partially Refunded';
      default:
        return 'No Payment';
    }
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Stats calculations
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const upcomingAppointments = appointments.filter(apt =>
    apt.appointment_date >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/staff/dashboard" className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 hover:text-purple-600 transition-colors">
             SPORVEDA <span className="text-purple-600">Staff</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {profile?.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</span>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {profile?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{profile?.full_name || 'User'}</div>
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg shadow-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Welcome, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base">
            Staff Dashboard - Manage your appointments and schedule
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Requests</p>
                <h3 className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Upcoming</p>
                <h3 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {appointments.length > 0 && (
          <div className="mb-8">
            <Calendar appointments={appointments} userRole="staff" />
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {appointment.service.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">Patient:</span>
                          <span className="ml-1">{appointment.patient.full_name}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{appointment.patient.email}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{appointment.start_time} - {appointment.end_time} ({appointment.service.duration_minutes} min)</span>
                        </div>
                      </div>

                      {appointment.patient_notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Patient Notes:</span> {appointment.patient_notes}
                          </p>
                        </div>
                      )}

                      {/* Payment Information */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getPaymentStatusColor(appointment.payment_status)}`}>
                              {getPaymentStatusLabel(appointment.payment_status)}
                            </span>

                            {appointment.payment_amount && (
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-gray-900">
                                  ₹{appointment.payment_amount}
                                </span>
                              </div>
                            )}
                          </div>

                          {appointment.paid_at && (
                            <div className="text-xs text-gray-500">
                              Paid on {new Date(appointment.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Refund Information */}
                        {(appointment.payment_status === 'refunded' || appointment.payment_status === 'partially_refunded') && appointment.refund_amount && (
                          <div className="mt-2 flex items-center text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Refunded ₹{appointment.refund_amount}
                            {appointment.refunded_at && (
                              <span className="ml-2">
                                on {new Date(appointment.refunded_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          disabled={updatingStatus === appointment.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition text-sm font-medium"
                        >
                          {updatingStatus === appointment.id ? 'Updating...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          disabled={updatingStatus === appointment.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition text-sm font-medium"
                        >
                          {updatingStatus === appointment.id ? 'Updating...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          disabled={updatingStatus === appointment.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
                        >
                          {updatingStatus === appointment.id ? 'Updating...' : 'Mark Complete'}
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          disabled={updatingStatus === appointment.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition text-sm font-medium"
                        >
                          {updatingStatus === appointment.id ? 'Updating...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                      <span className="px-4 py-2 text-sm text-gray-600 italic">
                        No actions available
                      </span>
                    )}
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
