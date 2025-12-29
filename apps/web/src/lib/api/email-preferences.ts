/**
 * Email Preferences API - Replaces Supabase email preferences
 */

import { apiClient } from './client';

export interface EmailPreferences {
  [key: string]: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'instant' | 'daily' | 'weekly' | 'never';
  };
}

/**
 * Get email preferences
 */
export async function getEmailPreferences(): Promise<EmailPreferences | null> {
  try {
    return await apiClient.get<EmailPreferences>('/users/me/email-preferences');
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return null;
  }
}

/**
 * Update email preferences
 */
export async function updateEmailPreferences(
  preferences: EmailPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.put<EmailPreferences>('/users/me/email-preferences', preferences);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message || 'Failed to update preferences' };
  }
}

/**
 * Create default preferences
 */
export async function createDefaultPreferences(userId: string): Promise<EmailPreferences> {
  // Default preferences structure
  const defaultPrefs: EmailPreferences = {
    'post_likes': { email: true, inApp: true, push: false, sms: false, frequency: 'instant' },
    'post_comments': { email: true, inApp: true, push: false, sms: false, frequency: 'instant' },
    'post_mentions': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
    'connection_requests': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
    'messages': { email: true, inApp: true, push: true, sms: false, frequency: 'instant' },
    'events': { email: true, inApp: true, push: false, sms: false, frequency: 'daily' },
  };

  await updateEmailPreferences(defaultPrefs);
  return defaultPrefs;
}

/**
 * Unsubscribe all
 */
export async function unsubscribeAll(
  token: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement unsubscribe endpoint in API
  return { success: false, error: 'Unsubscribe endpoint not yet implemented' };
}

/**
 * Pause emails
 */
export async function pauseEmails(
  days: number
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement pause endpoint in API
  return { success: false, error: 'Pause endpoint not yet implemented' };
}

/**
 * Check if emails are paused
 */
export function isEmailsPaused(preferences: EmailPreferences | null): { paused: boolean; until?: Date } {
  // TODO: Implement pause check logic
  return { paused: false };
}
