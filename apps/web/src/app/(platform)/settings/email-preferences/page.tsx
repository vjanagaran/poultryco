'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEmailPreferences, updateEmailPreferences, type EmailPreferences as EmailPrefsType } from '@/lib/api/email-preferences';
import { Container, Card, CardHeader, CardContent, Button, Alert, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailPreferencesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPrefsType | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadPreferences();
  }, [user, router]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError('');
      
      const prefs = await getEmailPreferences();
      
      if (prefs) {
        setPreferences(prefs);
      } else {
        // Set default preferences structure
        const defaultPrefs: EmailPrefsType = {
          'post_likes': { email: true, inApp: true, push: false, sms: false, frequency: 'instant' },
          'post_comments': { email: true, inApp: true, push: false, sms: false, frequency: 'instant' },
          'post_mentions': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
          'connection_requests': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
          'messages': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
          'events': { email: true, inApp: true, push: false, sms: false, frequency: 'daily' },
        };
        setPreferences(defaultPrefs);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      const result = await updateEmailPreferences(preferences);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save email preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, field: 'email' | 'inApp' | 'push' | 'sms' | 'frequency', value: any) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: {
        ...preferences[key],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container className="py-8">
        <Alert variant="error">Failed to load preferences</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Email Preferences</h1>
            <p className="text-gray-600">Manage your email notification preferences</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert variant="success">Preferences saved successfully!</Alert>
            )}
            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            {/* Notification Types */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notification Types</h2>
              
              {Object.entries(preferences).map(([key, prefs]) => (
                <div key={key} className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium capitalize">{key.replace(/_/g, ' ')}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={prefs.email}
                        onChange={(e) => updatePreference(key, 'email', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Email</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={prefs.inApp}
                        onChange={(e) => updatePreference(key, 'inApp', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">In-App</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={prefs.push}
                        onChange={(e) => updatePreference(key, 'push', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Push</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={prefs.sms}
                        onChange={(e) => updatePreference(key, 'sms', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select
                      value={prefs.frequency}
                      onChange={(e) => updatePreference(key, 'frequency', e.target.value)}
                      className="w-full rounded border-gray-300"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
