'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Container, Card, CardHeader, CardContent, Button, Alert, Spinner } from '@/components/ui';

interface EmailPreferences {
  user_id: string;
  email_enabled: boolean;
  welcome_emails: boolean;
  onboarding_emails: boolean;
  engagement_emails: boolean;
  network_emails: boolean;
  achievement_emails: boolean;
  educational_emails: boolean;
  digest_emails: boolean;
  max_emails_per_day: number;
  max_emails_per_week: number;
  preferred_send_time?: string;
  timezone: string;
  unsubscribed_at?: string;
}

const defaultPreferences: Partial<EmailPreferences> = {
  email_enabled: true,
  welcome_emails: true,
  onboarding_emails: true,
  engagement_emails: true,
  network_emails: true,
  achievement_emails: true,
  educational_emails: true,
  digest_emails: true,
  max_emails_per_day: 2,
  max_emails_per_week: 7,
  timezone: 'Asia/Kolkata',
};

export default function EmailPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError('');
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch existing preferences
      const { data, error: fetchError } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        throw fetchError;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const newPrefs = {
          ...defaultPreferences,
          user_id: user.id,
        } as EmailPreferences;
        
        const { data: created, error: createError } = await supabase
          .from('user_email_preferences')
          .insert(newPrefs)
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(created);
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

      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from('user_email_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', preferences.user_id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!preferences) return;
    
    if (!confirm('Are you sure you want to unsubscribe from all emails? You can re-subscribe anytime.')) {
      return;
    }

    const updated = {
      ...preferences,
      email_enabled: false,
      unsubscribed_at: new Date().toISOString(),
    };
    
    setPreferences(updated);
    await handleSave();
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container className="py-8">
        <Alert variant="error">
          Failed to load email preferences. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Preferences</h1>
        <p className="text-gray-600 mt-2">
          Control what emails you receive and how often
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          Your email preferences have been saved successfully!
        </Alert>
      )}

      {preferences.unsubscribed_at && (
        <Alert variant="warning" className="mb-6">
          You are currently unsubscribed from all emails. Toggle the master switch below to re-subscribe.
        </Alert>
      )}

      <div className="space-y-6">
        {/* Master Switch */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Email Notifications</h2>
            <p className="text-gray-600 text-sm mt-1">
              Master switch for all email communications
            </p>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-900">Receive emails from PoultryCo</span>
              <input
                type="checkbox"
                checked={preferences.email_enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  email_enabled: e.target.checked,
                  unsubscribed_at: e.target.checked ? undefined : new Date().toISOString(),
                })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
            </label>
          </CardContent>
        </Card>

        {/* Email Categories */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Email Categories</h2>
            <p className="text-gray-600 text-sm mt-1">
              Choose which types of emails you'd like to receive
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Welcome & Onboarding</span>
                  <p className="text-sm text-gray-600">
                    Tips and guides to help you get started
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.onboarding_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    onboarding_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Engagement & Activity</span>
                  <p className="text-sm text-gray-600">
                    Updates about your posts, connections, and interactions
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.engagement_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    engagement_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Network Updates</span>
                  <p className="text-sm text-gray-600">
                    Connection requests and network suggestions
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.network_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    network_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Achievements & Milestones</span>
                  <p className="text-sm text-gray-600">
                    Celebrate your accomplishments and progress
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.achievement_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    achievement_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Educational Content</span>
                  <p className="text-sm text-gray-600">
                    Industry insights, tips, and best practices
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.educational_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    educational_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900">Weekly/Monthly Digests</span>
                  <p className="text-sm text-gray-600">
                    Summary of platform activity and highlights
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.digest_emails}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    digest_emails: e.target.checked,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Frequency Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Email Frequency</h2>
            <p className="text-gray-600 text-sm mt-1">
              Limit how many emails you receive
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum emails per day
                </label>
                <select
                  value={preferences.max_emails_per_day}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    max_emails_per_day: parseInt(e.target.value),
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:opacity-50"
                >
                  <option value={1}>1 email per day</option>
                  <option value={2}>2 emails per day</option>
                  <option value={3}>3 emails per day</option>
                  <option value={5}>5 emails per day</option>
                  <option value={10}>10 emails per day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum emails per week
                </label>
                <select
                  value={preferences.max_emails_per_week}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    max_emails_per_week: parseInt(e.target.value),
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:opacity-50"
                >
                  <option value={3}>3 emails per week</option>
                  <option value={5}>5 emails per week</option>
                  <option value={7}>7 emails per week</option>
                  <option value={10}>10 emails per week</option>
                  <option value={20}>20 emails per week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred send time
                </label>
                <select
                  value={preferences.preferred_send_time || ''}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferred_send_time: e.target.value || undefined,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:opacity-50"
                >
                  <option value="">No preference</option>
                  <option value="06:00">6:00 AM</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    timezone: e.target.value,
                  })}
                  disabled={!preferences.email_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:opacity-50"
                >
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">US Eastern (EST/EDT)</option>
                  <option value="America/Chicago">US Central (CST/CDT)</option>
                  <option value="America/Denver">US Mountain (MST/MDT)</option>
                  <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
                  <option value="Europe/London">UK (GMT/BST)</option>
                  <option value="Europe/Paris">Central Europe (CET/CEST)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                  <option value="Australia/Sydney">Australia Eastern (AEST/AEDT)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handleUnsubscribeAll}
            disabled={!preferences.email_enabled || saving}
          >
            Unsubscribe from All
          </Button>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}