'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestOtp, verifyOtp, signInWithOAuth } from '@/lib/auth/hybrid-auth';

type Step = 'email' | 'otp' | 'name' | 'complete';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSocialAuth = async (provider: 'google' | 'linkedin') => {
    setLoading(true);
    setError(null);

    try {
      await signInWithOAuth(provider);
      // OAuth redirect will happen
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const result = await requestOtp({ email, channel: 'email' });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      setIsNewUser(result.isNewUser || false);
      setOtpSent(true);
      setResendCooldown(45); // 45 seconds cooldown
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await requestOtp({ email, channel: 'email' });

      if (!result.success) {
        throw new Error(result.error || 'Failed to resend OTP');
      }

      setResendCooldown(45);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      // For new users, we'll verify OTP first, then collect name
      // For existing users, verify and login directly
      const result = await verifyOtp({
        email,
        code: otp,
        fullName: isNewUser ? undefined : undefined, // Name will be collected in next step for new users
      });

      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_token', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      // If new user, collect name
      if (isNewUser) {
        setStep('name');
      } else {
        // Existing user - redirect to home
        const nextUrl = searchParams.get('next');
        router.push(nextUrl || '/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      // Clear OTP on error
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      // Update profile with name via API
      const { apiClient } = await import('@/lib/api/client');
      await apiClient.put('/users/profile', {
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        displayName: fullName,
      });

      // Proceed to completion step
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save name');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    router.push('/profile/complete');
  };

  const handleSkipToHome = () => {
    router.push('/home');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Step 1: Email Input */}
      {step === 'email' && (
        <>
          {/* Social Login - Alternate authentication options */}
          {/* TODO: Google OAuth will be fully integrated here as an alternate login option */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Continue →'}
            </button>
          </form>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h2>
            <p className="text-gray-600">
              We sent a 6-digit code to <span className="font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Code →'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-sm text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend verification code'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Change email address
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 3: Name Collection (New Users Only) */}
      {step === 'name' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your name?</h2>
            <p className="text-gray-600">We'll use this to personalize your experience</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-base"
                placeholder="John Doe"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !fullName.trim()}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </form>
        </>
      )}

      {/* Step 4: Complete Profile or Skip */}
      {step === 'complete' && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PoultryCo!</h2>
            <p className="text-gray-600">Complete your profile to get started</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCompleteProfile}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Complete Profile →
            </button>

            <button
              type="button"
              onClick={handleSkipToHome}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </>
      )}
    </div>
  );
}

