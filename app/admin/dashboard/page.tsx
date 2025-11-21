'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'staff' | 'admin';
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  status: string;
  patient: {
    full_name: string;
  };
  staff: {
    full_name: string;
  };
  service: {
    name: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'appointments'>('users');
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

      // Redirect non-admin users
      if (profileData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setProfile(profileData);
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    // Fetch all users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (usersData) setUsers(usersData);

    // Fetch all services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('name');
    if (servicesData) setServices(servicesData);

    // Fetch all appointments
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name),
        staff:profiles!appointments_staff_id_fkey(full_name),
        service:services(name)
      `)
      .order('appointment_date', { ascending: false })
      .limit(50);
    if (appointmentsData) setAppointments(appointmentsData);
  };

  const updateUserRole = async (userId: string, newRole: 'patient' | 'staff' | 'admin') => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        alert('Failed to update user role');
        return;
      }

      fetchAllData();
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) {
        alert('Failed to update service status');
        return;
      }

      fetchAllData();
    } catch (error) {
      console.error('Error updating service:', error);
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

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  const stats = {
    totalUsers: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    staff: users.filter(u => u.role === 'staff').length,
    activeServices: services.filter(s => s.is_active).length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin/dashboard" className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 hover:text-red-600 transition-colors">
              PhysioBook <span className="text-red-600">Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
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
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {profile?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-gray-600">{profile?.email}</div>
                </div>
              </div>
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
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg shadow-red-500/20">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Welcome, {profile?.full_name || 'Admin'}!
          </h1>
          <p className="text-red-100 text-sm sm:text-base">
            Manage users, services, and appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Patients</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.patients}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Staff</p>
            <h3 className="text-2xl font-bold text-purple-600">{stats.staff}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Active Services</p>
            <h3 className="text-2xl font-bold text-green-600">{stats.activeServices}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Appointments</p>
            <h3 className="text-2xl font-bold text-indigo-600">{stats.totalAppointments}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-600">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'services'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'appointments'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Appointments ({appointments.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'staff' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            disabled={user.id === profile?.id}
                          >
                            <option value="patient">Patient</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{service.duration_minutes} minutes</span>
                        <span>•</span>
                        <span>${service.price} {service.currency}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        service.is_active
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {apt.start_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {apt.patient.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {apt.staff.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {apt.service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
