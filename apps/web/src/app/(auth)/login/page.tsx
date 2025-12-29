import { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Login | PoultryCo',
  description: 'Sign in to your PoultryCo account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to PoultryCo
          </h1>
          <p className="text-lg text-gray-600">
            Connect with poultry professionals worldwide
          </p>
        </div>

        {/* Unified Auth Form */}
        <Suspense fallback={<div className="bg-white rounded-2xl shadow-xl p-8 text-center">Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}

