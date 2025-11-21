'use client';

import { useState } from 'react';

export default function TestPage() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const addOutput = (text: string) => {
    setOutput(prev => prev + '\n' + text);
  };

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(true);
    addOutput(`\n🧪 Testing: ${name}`);
    addOutput(`   URL: ${url}`);

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      addOutput(`   ✅ Status: ${response.status}`);
      addOutput(`   Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addOutput(`   ❌ Error: ${error}`);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setOutput('🚀 Starting Backend Tests...\n');

    // Test 1: Services
    await testEndpoint('Get Services', '/api/services');

    // Test 2: Users
    await testEndpoint('Get Staff List', '/api/users?role=staff');

    // Test 3: Create User
    await testEndpoint('Create Test User', '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'patient'
      })
    });

    // Test 4: Login
    await testEndpoint('Login Test User', '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    // Test 5: Get Profile
    await testEndpoint('Get Profile', '/api/profile');

    addOutput('\n✅ All tests completed!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Backend API Tester</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>

          <div className="space-y-2">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 w-full"
            >
              {loading ? '⏳ Running Tests...' : '▶️ Run All Tests'}
            </button>

            <button
              onClick={() => testEndpoint('Get Services', '/api/services')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              Test Services Endpoint
            </button>

            <button
              onClick={() => testEndpoint('Get Staff', '/api/users?role=staff')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
            >
              Test Staff List
            </button>

            <button
              onClick={() => setOutput('')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
            >
              Clear Output
            </button>
          </div>
        </div>

        <div className="bg-black text-green-400 rounded-lg shadow p-6 font-mono text-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-bold">Console Output</h3>
            <span className="text-gray-400 text-xs">Scroll for more</span>
          </div>
          <pre className="whitespace-pre-wrap overflow-auto max-h-96">
            {output || 'Click a button to run tests...'}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ Before Testing:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Make sure you created a Supabase project</li>
            <li>Updated .env.local with your credentials</li>
            <li>Ran both database migration files in Supabase SQL Editor</li>
            <li>Development server is running (npm run dev)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
