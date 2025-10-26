'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HomepageRouter - Redirects authenticated users to home
 * Similar to LinkedIn's behavior where logged-in users go straight to their dashboard
 */
export function HomepageRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is logged in, redirect to home (customizable dashboard)
      router.push('/home');
    }
  }, [user, loading, router]);

  // This component doesn't render anything
  return null;
}

