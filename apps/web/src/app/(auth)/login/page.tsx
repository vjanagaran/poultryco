import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

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
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to your PoultryCo account
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-medium text-green-600 hover:text-green-500">
              Join PoultryCo
            </a>
          </p>
          <p className="text-sm text-gray-600">
            <a href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

