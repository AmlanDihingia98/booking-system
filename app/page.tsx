import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">PhysioBook</h1>
            <div className="flex items-center space-x-6">
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
          </div>
        </div>
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
          <div className="mt-12 flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transform"
            >
              Book Your Appointment
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/services"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-200 transition-all"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
            Why choose PhysioBook?
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
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive physiotherapy treatments tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Initial Consultation', duration: '60 min', price: '$120', color: 'blue' },
              { name: 'Follow-up Session', duration: '45 min', price: '$90', color: 'green' },
              { name: 'Sports Injury Treatment', duration: '60 min', price: '$110', color: 'red' },
              { name: 'Manual Therapy', duration: '30 min', price: '$70', color: 'purple' },
              { name: 'Rehabilitation Session', duration: '60 min', price: '$100', color: 'indigo' },
            ].map((service, index) => (
              <div
                key={service.name}
                className="group bg-white p-6 rounded-2xl border border-gray-200/50 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-${service.color}-600 to-${service.color}-700`}>
                    {service.price}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration}
                </div>
              </div>
            ))}

            <Link
              href="/services"
              className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <div className="text-center">
                <div className="text-lg font-semibold mb-1">View All Services</div>
                <div className="text-sm text-blue-100 group-hover:text-white transition-colors">
                  Explore our complete range →
                </div>
              </div>
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
              <h3 className="text-xl font-semibold text-gray-900">PhysioBook</h3>
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
              © 2025 PhysioBook. Built with Next.js & Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
