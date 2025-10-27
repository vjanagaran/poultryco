'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { unsubscribeAll } from '@/lib/api/email-preferences';
import { Container, Card, CardContent, Button, Alert } from '@/components/ui';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  useEffect(() => {
    if (!token) {
      setError('Invalid unsubscribe link');
    }
  }, [token]);
  
  const handleUnsubscribe = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    const result = await unsubscribeAll(token, reason);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to unsubscribe');
    }
    
    setLoading(false);
  };
  
  if (success) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Successfully Unsubscribed
            </h1>
            <p className="text-gray-600 mb-6">
              You have been unsubscribed from {type ? `${type} emails` : 'all emails'}.
              We're sorry to see you go!
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Return to PoultryCo
              </Button>
              <p className="text-sm text-gray-500">
                Changed your mind? You can update your preferences anytime from your settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Unsubscribe from Emails
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            {type 
              ? `You're about to unsubscribe from ${type} emails.`
              : "You're about to unsubscribe from all PoultryCo emails."
            }
          </p>
          
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Help us improve (optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="too_many">Too many emails</option>
              <option value="not_relevant">Content not relevant</option>
              <option value="privacy">Privacy concerns</option>
              <option value="temporary">Taking a break</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="destructive"
              onClick={handleUnsubscribe}
              disabled={loading || !token}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Confirm Unsubscribe'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6 text-center">
            Note: You will still receive important account and security emails.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
