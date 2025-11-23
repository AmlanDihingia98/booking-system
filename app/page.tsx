'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">SPORVEDA</h1>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/services"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Services
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
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
              <Link
                href="/services"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-gray-900 leading-tight">
            Your health,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              simplified.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Book physiotherapy appointments with ease. Connect with expert therapists and take control of your recovery journey.
          </p>
          <div className="mt-12 flex justify-center">
            <Link
              href="/auth/signup"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transform"
            >
              Book Your Appointment
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
            Why choose SPORVEDA?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your physiotherapy appointments in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group bg-white p-8 rounded-3xl border border-gray-200/50 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Scheduling</h3>
            <p className="text-gray-600 leading-relaxed">
              Intuitive calendar interface with real-time availability. Book appointments in seconds, not minutes.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-3xl border border-gray-200/50 hover:border-green-500/30 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Confirmation</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive immediate booking confirmation with automated reminders to keep you on track.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-3xl border border-gray-200/50 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Care</h3>
            <p className="text-gray-600 leading-relaxed">
              Work with certified physiotherapists dedicated to your recovery and wellbeing.
            </p>
          </div>
        </div>
      </div>

      {/* Services Preview */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive physiotherapy treatments designed for your recovery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Initial Consultation',
                duration: '60 min',
                price: '₹120',
                description: 'Comprehensive assessment of your condition with personalized treatment planning and expert guidance.',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
              },
              {
                name: 'Follow-up Session',
                duration: '45 min',
                price: '₹90',
                description: 'Continued treatment with progress monitoring and therapy adjustments for optimal recovery.',
                image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
              },
              {
                name: 'Sports Injury Treatment',
                duration: '60 min',
                price: '₹110',
                description: 'Specialized care for athletic injuries with techniques to restore strength and mobility.',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
              },
              {
                name: 'Manual Therapy',
                duration: '30 min',
                price: '₹70',
                description: 'Hands-on treatment to relieve pain, improve mobility and restore proper body function.',
                image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
              },
              {
                name: 'Rehabilitation Session',
                duration: '60 min',
                price: '₹100',
                description: 'Structured recovery program with exercises designed to rebuild strength and function.',
                image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
              },
            ].map((service, index) => (
              <div
                key={service.name}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${service.image})` }}
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
                    href="/services"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all group-hover:shadow-lg group-hover:shadow-gray-900/20"
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

          {/* View All Services CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transform"
            >
              View All Services
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-[3rem] p-12 md:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>

          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-tight">
              Ready to start your
              <br />
              recovery journey?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join our community and experience professional physiotherapy care tailored to your needs.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold text-gray-900">SPORVEDA</h3>
              <p className="text-sm text-gray-600 mt-1">Professional physiotherapy booking made simple.</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200/50">
            <p className="text-center text-sm text-gray-500">
              © 2025 SPORVEDA. Built with Next.js & Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
