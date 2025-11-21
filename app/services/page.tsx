'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  role: 'patient' | 'staff' | 'admin';
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchServices();
  }, []);

  const checkAuth = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);

    if (session) {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');

      if (response.ok) {
        const result = await response.json();
        setServices(result.data || []);
      } else {
        console.error('Error fetching services');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/dashboard';
    if (profile.role === 'staff') return '/staff/dashboard';
    if (profile.role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {isAuthenticated ? (
              <Link href={getDashboardLink()} className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
                MIRACLE
              </Link>
            ) : (
              <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
                MIRACLE
              </Link>
            )}

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  {profile?.role === 'patient' && (
                    <Link href="/book" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      Book Appointment
                    </Link>
                  )}
                  <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                        {profile?.full_name?.[0]?.toUpperCase() || 'U'}
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
                </>
              ) : (
                <>
                  <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Home
                  </Link>
                  <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Professional physiotherapy services tailored to your recovery needs
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 mb-4">No services available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {formatPrice(service.price, service.currency)}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {service.duration_minutes} minutes
                  </div>

                  <Link
                    href={
                      isAuthenticated
                        ? `/book?service=${service.id}`
                        : '/auth/login?redirect=/services'
                    }
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && services.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up now to book any of our professional physiotherapy services
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Create Account
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
