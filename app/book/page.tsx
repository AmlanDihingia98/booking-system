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

  const [paymentOption, setPaymentOption] = useState<'pay_now' | 'pay_later'>('pay_now');

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
        setSubmitting(false);
        return;
      }

      // Calculate end time
      const startDateTime = new Date(`${formData.appointment_date}T${formData.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
      const end_time = endDateTime.toTimeString().slice(0, 5);

      // Create appointment based on payment option
      const appointmentData: any = {
        patient_id: session.user.id,
        staff_id: formData.staff_id,
        service_id: formData.service_id,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: end_time,
        status: paymentOption === 'pay_now' ? 'pending' : 'confirmed',
        patient_notes: formData.patient_notes || null,
      };

      // Add payment_status based on payment option
      try {
        appointmentData.payment_status = paymentOption === 'pay_now' ? 'pending' : 'pay_later';
        appointmentData.payment_amount = service.price;
        appointmentData.payment_currency = 'INR';
      } catch (e) {
        // Column doesn't exist yet, skip
      }

      const { data: newAppointment, error: insertError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating appointment:', insertError);
        setError(`Failed to create appointment: ${insertError.message || 'Please try again.'}`);
        setSubmitting(false);
        return;
      }

      if (!newAppointment) {
        setError('Failed to create appointment. Please try again.');
        setSubmitting(false);
        return;
      }

      // Handle payment based on selected option
      if (paymentOption === 'pay_now') {
        // Create Stripe checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId: newAppointment.id,
            serviceId: formData.service_id,
            returnUrl: '/dashboard',
          }),
        });

        const { sessionId, url, error: checkoutError } = await response.json();

        if (checkoutError || !sessionId) {
          console.error('Error creating checkout session:', checkoutError);
          setError('Failed to initiate payment. Please try again.');
          setSubmitting(false);
          return;
        }

        // Redirect to Stripe Checkout using the URL
        if (url) {
          window.location.href = url;
        } else {
          setError('Failed to get payment URL. Please try again.');
          setSubmitting(false);
        }
      } else {
        // Pay later - redirect to dashboard with success message
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard?booking=success&payment=later');
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
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
             SPORVEDA
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
              <p className="font-semibold">Appointment booked successfully!</p>
              <p className="text-sm mt-1">
                {paymentOption === 'pay_later'
                  ? 'You can complete payment after your appointment. Redirecting to dashboard...'
                  : 'Redirecting to dashboard...'
                }
              </p>
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
                    {service.name} - ₹{service.price} ({service.duration_minutes} min)
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

            {/* Payment Option */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <label className="block text-sm font-medium text-gray-900 mb-4">
                Payment Option *
              </label>
              <div className="space-y-3">
                <label className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentOption === 'pay_now'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    value="pay_now"
                    checked={paymentOption === 'pay_now'}
                    onChange={(e) => setPaymentOption('pay_now')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Pay Now</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay securely via Stripe (Cards, UPI, Wallets)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ Instant confirmation • ✓ Secure payment • ✓ Digital receipt
                    </p>
                  </div>
                </label>

                <label className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentOption === 'pay_later'
                    ? 'border-purple-500 bg-purple-50/50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    value="pay_later"
                    checked={paymentOption === 'pay_later'}
                    onChange={(e) => setPaymentOption('pay_later')}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3 flex-1">
                    <span className="font-semibold text-gray-900">Pay After Appointment</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete payment after your session
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Pay in-person or online after the appointment
                    </p>
                  </div>
                </label>
              </div>
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
                    <span className="font-medium">Price:</span> ₹{selectedService.price}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {paymentOption === 'pay_now'
                      ? '💳 Payment via Stripe (supports UPI, Cards, and Digital Wallets)'
                      : '💰 Payment after appointment completion'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || staffMembers.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : paymentOption === 'pay_now' ? (
                <>
                  Proceed to Payment {selectedService && `(₹${selectedService.price})`}
                </>
              ) : (
                <>
                  Confirm Appointment {selectedService && `(₹${selectedService.price})`}
                </>
              )}
            </button>
            {paymentOption === 'pay_now' && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Secure payment powered by Stripe
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
