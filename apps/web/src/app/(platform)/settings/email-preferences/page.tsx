'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getEmailPreferences,
  updateEmailPreferences,
  pauseEmails,
  type EmailPreferences,
  isEmailsPaused,
} from '@/lib/api/email-preferences';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Button,
  Alert,
  InlineLoading,
} from '@/components/ui';
import { Form, FormSection, FormActions } from '@/components/ui/Form';

export default function EmailPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    const prefs = await getEmailPreferences();
    if (prefs) {
      setPreferences(prefs);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    const result = await updateEmailPreferences(preferences);
    
    if (result.success) {
      setSuccessMessage('Email preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.error || 'Failed to update preferences');
    }
    
    setSaving(false);
  };

  const handlePauseEmails = async (days: number) => {
    setSaving(true);
    const result = await pauseEmails(days);
    
    if (result.success) {
      setSuccessMessage(`Emails paused for ${days} days`);
      setShowPauseModal(false);
      await loadPreferences();
    } else {
      setErrorMessage(result.error || 'Failed to pause emails');
    }
    
    setSaving(false);
  };

  const togglePreference = (key: keyof EmailPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key as keyof EmailPreferences],
    });
  };

  if (loading) {
    return (
      <Container className="py-8">
        <InlineLoading />
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container className="py-8">
        <Alert variant="error">Failed to load email preferences</Alert>
      </Container>
    );
  }

  const pauseInfo = isEmailsPaused(preferences);

  return (
    <Container className="py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
        <p className="text-gray-600">
          Control what emails you receive and how often
        </p>
      </div>

      {pauseInfo.paused && (
        <Alert variant="warning" className="mb-6">
          <strong>Emails Paused</strong>
          <p>Your emails are paused until {pauseInfo.until?.toLocaleDateString()}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPreferences({ ...preferences, all_emails_enabled: true });
              handleSave();
            }}
            className="mt-2"
          >
            Resume Emails
          </Button>
        </Alert>
      )}

      <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Master Switch */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Emails</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Master switch for all email communications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.all_emails_enabled}
                  onChange={() => togglePreference('all_emails_enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Email Categories */}
        <div className="space-y-6">
          {/* Security (Always On) */}
          <FormSection title="Security & Account" description="These emails cannot be disabled for security reasons">
            <div className="space-y-4">
              <PreferenceToggle
                label="Security Alerts"
                description="Password changes, login from new devices"
                checked={true}
                disabled={true}
              />
              <PreferenceToggle
                label="Account Updates"
                description="Important account changes and policy updates"
                checked={true}
                disabled={true}
              />
            </div>
          </FormSection>

          {/* Notifications */}
          <FormSection title="Notifications" description="Stay updated with your network activity">
            <div className="space-y-4">
              <PreferenceToggle
                label="Connection Requests"
                description="When someone wants to connect with you"
                checked={preferences.connection_requests}
                onChange={() => togglePreference('connection_requests')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Messages"
                description="Direct messages from your connections"
                checked={preferences.messages}
                onChange={() => togglePreference('messages')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Mentions"
                description="When someone mentions you in posts or comments"
                checked={preferences.mentions}
                onChange={() => togglePreference('mentions')}
                disabled={!preferences.all_emails_enabled}
              />
            </div>
          </FormSection>

          {/* Engagement */}
          <FormSection title="Engagement" description="Emails to help you stay active">
            <div className="space-y-4">
              <PreferenceToggle
                label="Activity Updates"
                description="Updates about your profile views and network activity"
                checked={preferences.activity_updates}
                onChange={() => togglePreference('activity_updates')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Milestone Achievements"
                description="Celebrate your achievements and milestones"
                checked={preferences.milestone_achievements}
                onChange={() => togglePreference('milestone_achievements')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Content Suggestions"
                description="Tips and suggestions to improve your content"
                checked={preferences.content_suggestions}
                onChange={() => togglePreference('content_suggestions')}
                disabled={!preferences.all_emails_enabled}
              />
            </div>
          </FormSection>

          {/* Marketing */}
          <FormSection title="Marketing & Updates" description="News and promotional content">
            <div className="space-y-4">
              <PreferenceToggle
                label="Product Updates"
                description="New features and platform improvements"
                checked={preferences.product_updates}
                onChange={() => togglePreference('product_updates')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Newsletter"
                description="Industry news and insights"
                checked={preferences.newsletter}
                onChange={() => togglePreference('newsletter')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Event Invitations"
                description="Invites to webinars and industry events"
                checked={preferences.event_invitations}
                onChange={() => togglePreference('event_invitations')}
                disabled={!preferences.all_emails_enabled}
              />
              <PreferenceToggle
                label="Promotional Offers"
                description="Special offers and discounts"
                checked={preferences.promotional_offers}
                onChange={() => togglePreference('promotional_offers')}
                disabled={!preferences.all_emails_enabled}
              />
            </div>
          </FormSection>

          {/* Digest Settings */}
          <FormSection title="Email Digest" description="Receive a summary of your activity">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digest Frequency
                </label>
                <select
                  value={preferences.digest_frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    digest_frequency: e.target.value as EmailPreferences['digest_frequency'],
                  })}
                  disabled={!preferences.all_emails_enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {preferences.digest_frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Day
                  </label>
                  <select
                    value={preferences.digest_day || 1}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      digest_day: parseInt(e.target.value),
                    })}
                    disabled={!preferences.all_emails_enabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              )}
            </div>
          </FormSection>

          {/* Frequency Limits */}
          <FormSection title="Frequency Limits" description="Control how many emails you receive">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum emails per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={preferences.max_emails_per_day}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    max_emails_per_day: parseInt(e.target.value),
                  })}
                  disabled={!preferences.all_emails_enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum emails per week
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={preferences.max_emails_per_week}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    max_emails_per_week: parseInt(e.target.value),
                  })}
                  disabled={!preferences.all_emails_enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </FormSection>

          {/* Quiet Hours */}
          <FormSection title="Quiet Hours" description="Don't receive emails during specific hours">
            <div className="space-y-4">
              <PreferenceToggle
                label="Enable Quiet Hours"
                description="No emails during your quiet hours"
                checked={preferences.quiet_hours_enabled}
                onChange={() => togglePreference('quiet_hours_enabled')}
                disabled={!preferences.all_emails_enabled}
              />
              
              {preferences.quiet_hours_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quiet_hours_start || '22:00'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quiet_hours_start: e.target.value,
                      })}
                      disabled={!preferences.all_emails_enabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quiet_hours_end || '08:00'}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quiet_hours_end: e.target.value,
                      })}
                      disabled={!preferences.all_emails_enabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </FormSection>
        </div>

        {successMessage && (
          <Alert variant="success" className="mt-6">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="error" className="mt-6">
            {errorMessage}
          </Alert>
        )}

        <FormActions className="mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPauseModal(true)}
          >
            Pause Emails
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </FormActions>
      </Form>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Pause Emails</h3>
            <p className="text-gray-600 mb-6">
              How long would you like to pause email notifications?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handlePauseEmails(7)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                1 week
              </button>
              <button
                onClick={() => handlePauseEmails(14)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                2 weeks
              </button>
              <button
                onClick={() => handlePauseEmails(30)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                30 days
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPauseModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

// Helper Component
function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 ${disabled ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'peer-checked:bg-gray-400' : 'peer-checked:bg-primary'}`}></div>
      </label>
    </div>
  );
}
