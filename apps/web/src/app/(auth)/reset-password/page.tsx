import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | PoultryCo',
  description: 'Set a new password for your PoultryCo account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Reset Password
          </h1>
          <p className="text-lg text-gray-600">
            Choose a new password for your account
          </p>
        </div>

        {/* Reset Password Form */}
        <ResetPasswordForm />
      </div>
    </div>
  );
}

