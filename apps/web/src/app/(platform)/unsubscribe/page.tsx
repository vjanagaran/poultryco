'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Container, Card, CardContent, Button, Alert, Spinner } from '@/components/ui';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid unsubscribe link');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const supabase = createClient();
      
      // Find user by unsubscribe token
      const { data, error: fetchError } = await supabase
        .from('user_email_preferences')
        .select('user_id, profiles!inner(email)')
        .eq('unsubscribe_token', token)
        .single();

      if (fetchError || !data) {
        setError('Invalid or expired unsubscribe link');
        return;
      }

      setUserEmail((data as any).profiles.email);
    } catch (err) {
      console.error('Error verifying token:', err);
      setError('Failed to verify unsubscribe link');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) return;

    try {
      setProcessing(true);
      setError('');

      const supabase = createClient();
      
      // Update preferences to unsubscribe
      const { error: updateError } = await supabase
        .from('user_email_preferences')
        .update({
          email_enabled: false,
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Unsubscribed Successfully
            </h1>
            <p className="text-gray-600 mb-8">
              You have been unsubscribed from all PoultryCo emails.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Changed your mind? You can update your preferences anytime from your account settings.
            </p>
            <div className="space-y-3">
              <Link href="/home">
                <Button variant="primary" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
              <Link href="/settings/email-preferences">
                <Button variant="outline" className="w-full">
                  Manage Email Preferences
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error && !userEmail) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Unsubscribe Link
            </h1>
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
            <p className="text-sm text-gray-600 mb-6">
              The unsubscribe link may be expired or invalid. Please use the link from a recent email or manage your preferences from your account.
            </p>
            <Link href="/home">
              <Button variant="primary" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unsubscribe from Emails
          </h1>
          
          {userEmail && (
            <p className="text-gray-600 mb-6">
              Are you sure you want to unsubscribe <strong>{userEmail}</strong> from all PoultryCo emails?
            </p>
          )}
          
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleUnsubscribe}
              disabled={processing}
              className="w-full"
            >
              {processing ? 'Processing...' : 'Yes, Unsubscribe Me'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/home')}
              disabled={processing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            You can re-subscribe or manage specific email preferences anytime from your account settings.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
