'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
              SPORVEDA
            </h1>
          </Link>
          <p className="text-gray-600">Email Verification Required</p>
        </div>

        {/* Verification Message Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Check Your Email
          </h2>

          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              We've sent a verification link to:
            </p>

            {email && (
              <p className="text-blue-600 font-semibold text-lg">
                {email}
              </p>
            )}

            <p className="text-gray-600 text-sm">
              Please click the verification link in the email to activate your account and complete the signup process.
            </p>

            <div className="bg-blue-50/80 backdrop-blur border border-blue-200/50 rounded-2xl p-4 mt-6">
              <p className="text-sm text-gray-700">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-gray-600 mt-2 space-y-1 text-left list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Return to SPORVEDA and sign in</li>
              </ol>
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/auth/login"
            className="block text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
