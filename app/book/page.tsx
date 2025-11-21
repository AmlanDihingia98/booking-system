'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  currency: string;
}

interface Staff {
  id: string;
  full_name: string;
  email: string;
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BookAppointmentPageContent />
    </Suspense>
  );
}

function BookAppointmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('service');

  const [services, setServices] = useState<Service[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    service_id: preselectedServiceId || '',
    staff_id: '',
    appointment_date: '',
    start_time: '',
    patient_notes: '',
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login?redirect=/book');
        return;
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setServices(servicesData || []);

      // Fetch staff members
      const { data: staffData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'staff')
        .order('full_name');

      setStaffMembers(staffData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load booking form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get service details
      const service = services.find((s) => s.id === formData.service_id);
      if (!service) {
        setError('Please select a service');
        return;
      }

      // Calculate end time
      const startDateTime = new Date(`${formData.appointment_date}T${formData.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
      const end_time = endDateTime.toTimeString().slice(0, 5);

      // Create appointment
      const { error: insertError } = await supabase.from('appointments').insert({
        patient_id: session.user.id,
        staff_id: formData.staff_id,
        service_id: formData.service_id,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: end_time,
        status: 'pending',
        patient_notes: formData.patient_notes || null,
      });

      if (insertError) {
        console.error('Error creating appointment:', insertError);
        setError('Failed to create appointment. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === formData.service_id);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
              PhysioBook
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to schedule your physiotherapy session
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Appointment booked successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                Select Service *
              </label>
              <select
                id="service"
                required
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Selection */}
            <div>
              <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-2">
                Select Therapist *
              </label>
              <select
                id="staff"
                required
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Choose a therapist...</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </option>
                ))}
              </select>
              {staffMembers.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No therapists available. Please contact support.
                </p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                id="date"
                required
                min={today}
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <input
                type="time"
                id="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.patient_notes}
                onChange={(e) => setFormData({ ...formData, patient_notes: e.target.value })}
                placeholder="Any specific concerns or requests..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Summary */}
            {selectedService && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Summary</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Service:</span> {selectedService.name}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {selectedService.duration_minutes}{' '}
                    minutes
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ${selectedService.price}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || staffMembers.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-lg"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
