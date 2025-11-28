'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Service {
  name: string;
  duration: string;
  price: string;
  description: string;
  image: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: 'patient' | 'staff' | 'admin';
}

// Static services data matching the landing page
const SERVICES: Service[] = [
  {
    name: 'MyoRelease Structural Therapy (Deep Tissue)',
    duration: '60 min',
    price: '₹1200',
    description: 'A deep-layer musculoskeletal therapy focused on breaking adhesions, releasing chronic knots, and restoring postural alignment. Ideal for athletes and individuals with long-standing tension.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
  },
  {
    name: 'NeuroCalm Circulatory Therapy (Swedish Therapy)',
    duration: '45 min',
    price: '₹1900',
    description: 'A rhythmic, slow-pressure therapy that improves circulation, calms the nervous system, and reduces stress-induced muscular tightness.',
    image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&q=80',
  },
  {
    name: 'VedaMyo Herbal Revitalization Therapy (Ayurveda Therapy)',
    duration: '60 min',
    price: '₹1100',
    description: 'A warm herbal oil rejuvenation that nourishes muscles, balances doshas, and supports long-term vitality and emotional grounding.',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80',
  },
  {
    name: 'Full-Body Rebalance Protocol (Top-to-Toe Therapy)',
    duration: '30 min',
    price: '₹1700',
    description: 'A complete head-to-toe therapeutic sequence designed to reset the entire body — muscles, circulation, energy flow, and relaxation.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  },
  {
    name: 'AxioSpine Pain Correction Therapy (Back Pain Relief)',
    duration: '60 min',
    price: '₹1100',
    description: 'A targeted spinal-care therapy that relieves lumbar tension, reduces nerve compression, and improves vertebral mobility for long-lasting pain relief.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
  },
  {
    name: 'Lower Limb Recovery Therapy (Leg Pain Relief)',
    duration: '60 min',
    price: '₹1100',
    description: 'A focused lower-body treatment for muscle fatigue, heavy legs, cramps, sports overuse, and circulation issues.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
  },
  {
    name: 'NeuroFlex Foot Pathway Therapy (Foot Reflexology)',
    duration: '60 min',
    price: '₹1100',
    description: 'A reflex-point stimulation therapy that activates neural pathways to improve organ function, energy flow, sleep quality, and overall balance.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80',
  },
  {
    name: 'Sporveda Signature Fusion Therapy (Sporveda Special)',
    duration: '60 min',
    price: '₹3499',
    description: 'A unique hybrid of sports therapy + Ayurveda, blending deep muscle techniques with herbal oil nourishment and energy balancing for total recovery.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    checkAuth();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {isAuthenticated ? (
              <Link href={getDashboardLink()} className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
                SPORVEDA
              </Link>
            ) : (
              <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
                SPORVEDA
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
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
            <span className="text-sm font-medium">8 Premium Therapies</span>
          </div>
          <h1 className="text-5xl font-bold mb-6">Our Therapeutic Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Experience the perfect blend of sports science and Ayurvedic healing. Each therapy is designed for maximum recovery, pain relief, and total body rejuvenation.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div
              key={service.name}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.duration}
                    </span>
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                      {service.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <Link
                  href={
                    isAuthenticated
                      ? `/book?service=${encodeURIComponent(service.name)}`
                      : '/auth/login?redirect=/services'
                  }
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/20"
                >
                  Book Now
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="relative">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <span className="flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-white">Free Consultation Available</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Begin Your Recovery Journey?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join 500+ clients who trust SPORVEDA for their therapy and wellness needs
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Book Free Consultation
                </Link>
                <Link
                  href="/auth/login"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
