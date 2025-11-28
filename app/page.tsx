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
            <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
              SPORVEDA
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
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
                href="/"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/services"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="#about"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.15),transparent_40%)]"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh]">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50">
                <span className="flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-sm font-medium text-blue-900">Trusted by 500+ Clients</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Premium Clinical Therapy
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700">
                  Meets Ancient Ayurveda
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Sports science + Ayurvedic healing for complete recovery. Trusted by 500+ clients for chronic pain, sports injuries, stress relief, and total body rejuvenation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transform"
                >
                  Book Free Consultation
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all hover:shadow-lg"
                >
                  Explore Therapies
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-4 border-t border-gray-200/50">
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ISO Certified
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  15+ Expert Therapists
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  4.9★ (500+ Reviews)
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
                  <img
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
                    alt="Professional therapy session at SPORVEDA"
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">98%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Floating Experience Badge */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm opacity-90">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose SPORVEDA - Stats & Benefits */}
      <div id="about" className="bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Why Choose SPORVEDA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              India's premier clinical therapy center where sports science meets ancient Ayurvedic healing
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {/* Stat 1 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4 group-hover:scale-110 transition-transform">
                <div className="text-4xl sm:text-5xl font-bold text-white">500+</div>
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">Happy Clients</div>
              <div className="text-sm text-gray-600 mt-1">Trusted & satisfied</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25 mb-4 group-hover:scale-110 transition-transform">
                <div className="text-4xl sm:text-5xl font-bold text-white">98%</div>
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">Success Rate</div>
              <div className="text-sm text-gray-600 mt-1">Proven results</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 mb-4 group-hover:scale-110 transition-transform">
                <div className="text-4xl sm:text-5xl font-bold text-white">50K+</div>
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">Sessions Done</div>
              <div className="text-sm text-gray-600 mt-1">Expert experience</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center group cursor-pointer">
              <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 mb-4 group-hover:scale-110 transition-transform">
                <div className="text-4xl sm:text-5xl font-bold text-white">4.9★</div>
              </div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">Client Rating</div>
              <div className="text-sm text-gray-600 mt-1">Highly recommended</div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-blue-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sports + Ayurveda Fusion</h3>
              <p className="text-gray-600 leading-relaxed">
                Unique blend of modern sports science with traditional Ayurvedic healing - a combination you won't find anywhere else
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-purple-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">15+ Expert Therapists</h3>
              <p className="text-gray-600 leading-relaxed">
                Certified professionals with 10+ years experience in sports therapy, Ayurveda, and clinical rehabilitation
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-green-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Personalized Treatment</h3>
              <p className="text-gray-600 leading-relaxed">
                Every session is customized to your specific condition, body type, and recovery goals - no generic protocols
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-amber-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Premium Facilities</h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art equipment, private therapy rooms, aromatherapy ambiance, and complimentary herbal refreshments
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-rose-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Flexible Scheduling</h3>
              <p className="text-gray-600 leading-relaxed">
                Easy online booking, same-day appointments available, and flexible payment options including pay-later
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="group bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600 leading-relaxed">
                98% success rate with chronic pain, sports injuries, and stress relief backed by client testimonials and reviews
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transform"
            >
              Book Your Free Consultation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Preview */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-12">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
