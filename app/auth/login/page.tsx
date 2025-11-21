'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
              PhysioBook
            </h1>
          </Link>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-200/50 text-red-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 text-center mb-3">
              Test credentials:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg">
                <span className="text-gray-600">Patient:</span>
                <code className="font-mono text-gray-900">admin@test.com / password123</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50/50 rounded-lg">
                <span className="text-gray-600">Staff:</span>
                <code className="font-mono text-gray-900">therapist1@test.com / password123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
