import { createClient } from '@/lib/supabase/client';

export interface EmailPreferences {
  user_id: string;
  all_emails_enabled: boolean;
  
  // Transactional (always enabled)
  security_alerts: boolean;
  account_updates: boolean;
  
  // Notifications
  connection_requests: boolean;
  messages: boolean;
  mentions: boolean;
  
  // Engagement
  activity_updates: boolean;
  milestone_achievements: boolean;
  content_suggestions: boolean;
  
  // Marketing
  product_updates: boolean;
  newsletter: boolean;
  event_invitations: boolean;
  promotional_offers: boolean;
  
  // Digest Settings
  digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
  digest_day?: number;
  digest_time?: string;
  
  // Advanced
  timezone: string;
  language: string;
  max_emails_per_day: number;
  max_emails_per_week: number;
  
  // Quiet Hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  
  // Channel Preferences
  prefer_in_app: boolean;
  prefer_sms: boolean;
  prefer_whatsapp: boolean;
  
  // Unsubscribe
  unsubscribe_token: string;
  unsubscribed_all: boolean;
  unsubscribed_at?: string;
  unsubscribe_reason?: string;
}

export async function getEmailPreferences(): Promise<EmailPreferences | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_email_preferences_v2')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // No preferences found, create default
    const defaultPrefs = await createDefaultPreferences(user.id);
    return defaultPrefs;
  }
  
  return data;
}

export async function updateEmailPreferences(
  preferences: Partial<EmailPreferences>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('user_email_preferences_v2')
    .update({
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function createDefaultPreferences(userId: string): Promise<EmailPreferences> {
  const supabase = createClient();
  
  const defaultPrefs: Partial<EmailPreferences> = {
    user_id: userId,
    all_emails_enabled: true,
    security_alerts: true,
    account_updates: true,
    connection_requests: true,
    messages: true,
    mentions: true,
    activity_updates: true,
    milestone_achievements: true,
    content_suggestions: true,
    product_updates: true,
    newsletter: true,
    event_invitations: true,
    promotional_offers: false,
    digest_frequency: 'weekly',
    digest_day: 1, // Monday
    digest_time: '09:00:00',
    timezone: 'Asia/Kolkata',
    language: 'en',
    max_emails_per_day: 3,
    max_emails_per_week: 10,
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00:00',
    quiet_hours_end: '08:00:00',
    prefer_in_app: false,
    prefer_sms: false,
    prefer_whatsapp: false,
    unsubscribed_all: false,
  };
  
  const { data, error } = await supabase
    .from('user_email_preferences_v2')
    .insert(defaultPrefs)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating default preferences:', error);
    return defaultPrefs as EmailPreferences;
  }
  
  return data;
}

export async function unsubscribeAll(
  token: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_email_preferences_v2')
    .update({
      unsubscribed_all: true,
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason,
      all_emails_enabled: false,
    })
    .eq('unsubscribe_token', token);
  
  if (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function pauseEmails(
  days: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  
  // Calculate pause end date
  const pauseEndDate = new Date();
  pauseEndDate.setDate(pauseEndDate.getDate() + days);
  
  // Temporarily disable emails
  const { error } = await supabase
    .from('user_email_preferences_v2')
    .update({
      all_emails_enabled: false,
      // Store pause end date in unsubscribe_reason temporarily
      unsubscribe_reason: `paused_until:${pauseEndDate.toISOString()}`,
    })
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error pausing emails:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// Helper function to check if emails are paused
export function isEmailsPaused(preferences: EmailPreferences): { paused: boolean; until?: Date } {
  if (preferences.unsubscribe_reason?.startsWith('paused_until:')) {
    const pauseEndDate = new Date(preferences.unsubscribe_reason.replace('paused_until:', ''));
    if (pauseEndDate > new Date()) {
      return { paused: true, until: pauseEndDate };
    }
  }
  return { paused: false };
}
