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
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
  paid_at?: string;
  refund_amount?: number;
  refunded_at?: string;
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
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    currency: 'INR',
  });
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [editAppointmentData, setEditAppointmentData] = useState({
    appointment_date: '',
    start_time: '',
    status: '',
  });

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

      const newStatus = !currentStatus;

      const { data, error } = await supabase
        .from('services')
        .update({ is_active: newStatus })
        .eq('id', serviceId)
        .select();

      if (error) {
        console.error('Update error:', error);
        alert('Failed to update service status: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        alert('No service was updated. Please check permissions.');
        return;
      }

      fetchAllData();
      alert(`Service ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Unexpected error: ' + (error as Error).message);
    }
  };

  const addNewService = async () => {
    try {
      if (!newService.name || newService.price <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          description: newService.description || null,
          duration_minutes: newService.duration_minutes,
          price: newService.price,
          currency: newService.currency,
          is_active: true,
        });

      if (error) {
        alert('Failed to create service: ' + error.message);
        return;
      }

      // Reset form
      setNewService({
        name: '',
        description: '',
        duration_minutes: 30,
        price: 0,
        currency: 'INR',
      });
      setShowAddServiceForm(false);
      fetchAllData();
      alert('Service created successfully!');
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service');
    }
  };

  const deleteService = async (serviceId: string, serviceName: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // First check if there are any appointments using this service
      const { data: appointmentsUsingService, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('service_id', serviceId)
        .limit(1);

      if (checkError) {
        alert('Error checking service usage: ' + checkError.message);
        return;
      }

      // If appointments exist, prevent deletion
      if (appointmentsUsingService && appointmentsUsingService.length > 0) {
        alert(
          `Cannot delete "${serviceName}" because it has associated appointments.\n\n` +
          `Please deactivate the service instead to prevent new bookings while preserving existing appointment records.`
        );
        return;
      }

      // If no appointments, confirm deletion
      const confirmed = window.confirm(
        `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`
      );

      if (!confirmed) return;

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        alert('Failed to delete service: ' + error.message);
        return;
      }

      fetchAllData();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const startEditingAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    setEditAppointmentData({
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      status: appointment.status,
    });
  };

  const cancelEditingAppointment = () => {
    setEditingAppointment(null);
    setEditAppointmentData({
      appointment_date: '',
      start_time: '',
      status: '',
    });
  };

  const updateAppointment = async (appointmentId: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: editAppointmentData.appointment_date,
          start_time: editAppointmentData.start_time,
          status: editAppointmentData.status,
        })
        .eq('id', appointmentId);

      if (error) {
        alert('Failed to update appointment: ' + error.message);
        return;
      }

      cancelEditingAppointment();
      fetchAllData();
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const deleteAppointment = async (appointmentId: string, patientName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the appointment for ${patientName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        alert('Failed to delete appointment: ' + error.message);
        return;
      }

      fetchAllData();
      alert('Appointment deleted successfully!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
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

  const getPaymentStatusColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'partially_refunded':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'partially_refunded':
        return 'Partial Refund';
      default:
        return 'N/A';
    }
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
             SPORVEDA <span className="text-red-600">Admin</span>
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
              <div className="space-y-6">
                {/* Add Service Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Services</h3>
                  <button
                    onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showAddServiceForm ? 'Cancel' : 'Add New Service'}
                  </button>
                </div>

                {/* Add Service Form */}
                {showAddServiceForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New Service</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          placeholder="e.g., Sports Massage"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes) *
                        </label>
                        <input
                          type="number"
                          value={newService.duration_minutes}
                          onChange={(e) => setNewService({ ...newService, duration_minutes: parseInt(e.target.value) })}
                          min="15"
                          step="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                          min="0"
                          step="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <input
                          type="text"
                          value={newService.currency}
                          onChange={(e) => setNewService({ ...newService, currency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newService.description}
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                          placeholder="Brief description of the service..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={addNewService}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Create Service
                      </button>
                    </div>
                  </div>
                )}

                {/* Services List */}
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
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
                            <span>₹{service.price} {service.currency}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => toggleServiceStatus(service.id, service.is_active)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              service.is_active
                                ? 'bg-amber-600 text-white hover:bg-amber-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteService(service.id, service.name)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className={editingAppointment === apt.id ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingAppointment === apt.id ? (
                            <input
                              type="date"
                              value={editAppointmentData.appointment_date}
                              onChange={(e) => setEditAppointmentData({ ...editAppointmentData, appointment_date: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            new Date(apt.appointment_date).toLocaleDateString()
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingAppointment === apt.id ? (
                            <input
                              type="time"
                              value={editAppointmentData.start_time}
                              onChange={(e) => setEditAppointmentData({ ...editAppointmentData, start_time: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            apt.start_time
                          )}
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
                          {editingAppointment === apt.id ? (
                            <select
                              value={editAppointmentData.status}
                              onChange={(e) => setEditAppointmentData({ ...editAppointmentData, status: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {apt.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(apt.payment_status)}`}>
                            {getPaymentStatusLabel(apt.payment_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {apt.payment_amount ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">₹{apt.payment_amount}</span>
                              {apt.refund_amount && apt.refund_amount > 0 && (
                                <span className="text-xs text-purple-600">Refund: ₹{apt.refund_amount}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingAppointment === apt.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateAppointment(apt.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditingAppointment}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditingAppointment(apt)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAppointment(apt.id, apt.patient.full_name)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          )}
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
