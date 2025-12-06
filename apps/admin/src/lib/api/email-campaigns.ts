// TODO: Migrate to API endpoints
// import { apiClient } from './client';

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  html_body: string;
  text_body: string;
  category: string;
  min_profile_strength?: number;
  max_profile_strength?: number;
  user_segment: string[];
  is_active: boolean;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  type: 'drip' | 'behavioral' | 'milestone' | 're-engagement' | 'educational' | 'promotional';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  targeting_rules: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignStep {
  id: string;
  campaign_id: string;
  step_number: number;
  template_id: string;
  delay_days: number;
  delay_hours: number;
  send_time?: string;
  conditions: Record<string, unknown>;
  is_active: boolean;
  template?: EmailTemplate;
}

export interface EmailQueueItem {
  id: string;
  recipient_id: string;
  recipient_email: string;
  template_id?: string;
  campaign_id?: string;
  subject: string;
  status: string;
  priority: number;
  scheduled_for: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

// Email Templates - TODO: Migrate to API
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return [];
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  return null;
}

export async function createEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
  throw new Error('Not implemented: API migration pending');
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
  throw new Error('Not implemented: API migration pending');
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Email Campaigns - TODO: Migrate to API
export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  return [];
}

export async function getEmailCampaign(id: string): Promise<EmailCampaign | null> {
  return null;
}

export async function createEmailCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
  throw new Error('Not implemented: API migration pending');
}

export async function updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
  throw new Error('Not implemented: API migration pending');
}

export async function deleteEmailCampaign(id: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Campaign Steps - TODO: Migrate to API
export async function getCampaignSteps(campaignId: string): Promise<CampaignStep[]> {
  return [];
}

export async function createCampaignStep(step: Partial<CampaignStep>): Promise<CampaignStep> {
  throw new Error('Not implemented: API migration pending');
}

export async function updateCampaignStep(id: string, updates: Partial<CampaignStep>): Promise<CampaignStep> {
  throw new Error('Not implemented: API migration pending');
}

export async function deleteCampaignStep(id: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Email Queue - TODO: Migrate to API
export async function getEmailQueue(filters?: {
  status?: string;
  campaign_id?: string;
  limit?: number;
}): Promise<EmailQueueItem[]> {
  return [];
}

export async function retryFailedEmails(): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}
