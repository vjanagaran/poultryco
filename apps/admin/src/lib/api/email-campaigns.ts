import { createClient } from '@/lib/supabase/client';

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

// Email Templates
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createEmailTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_templates')
    .insert(template)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Email Campaigns
export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getEmailCampaign(id: string): Promise<EmailCampaign | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createEmailCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      ...campaign,
      targeting_rules: campaign.targeting_rules || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEmailCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEmailCampaign(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Campaign Steps
export async function getCampaignSteps(campaignId: string): Promise<CampaignStep[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('campaign_steps')
    .select('*, template:email_templates(*)')
    .eq('campaign_id', campaignId)
    .order('step_number');
  
  if (error) throw error;
  return data || [];
}

export async function createCampaignStep(step: Partial<CampaignStep>): Promise<CampaignStep> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('campaign_steps')
    .insert({
      ...step,
      conditions: step.conditions || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCampaignStep(id: string, updates: Partial<CampaignStep>): Promise<CampaignStep> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('campaign_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCampaignStep(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('campaign_steps')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Email Queue
export async function getEmailQueue(filters?: {
  status?: string;
  campaign_id?: string;
  limit?: number;
}): Promise<EmailQueueItem[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('email_queue')
    .select('*')
    .order('scheduled_for', { ascending: true });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// Campaign Analytics
export async function getCampaignAnalytics(campaignId: string): Promise<{
  overview: EmailCampaign;
  performance: {
    sent_rate: number;
    open_rate: number;
    click_rate: number;
    unsubscribe_rate: number;
  };
  daily_stats: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  top_links: Array<{
    url: string;
    clicks: number;
  }>;
}> {
  const supabase = createClient();
  
  // Get campaign overview
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
  
  if (!campaign) throw new Error('Campaign not found');
  
  // Calculate performance metrics
  const performance = {
    sent_rate: campaign.total_recipients > 0 
      ? (campaign.total_sent / campaign.total_recipients) * 100 
      : 0,
    open_rate: campaign.total_sent > 0 
      ? (campaign.total_opened / campaign.total_sent) * 100 
      : 0,
    click_rate: campaign.total_opened > 0 
      ? (campaign.total_clicked / campaign.total_opened) * 100 
      : 0,
    unsubscribe_rate: campaign.total_sent > 0 
      ? (campaign.total_unsubscribed / campaign.total_sent) * 100 
      : 0,
  };
  
  // Get daily stats (mock for now)
  const daily_stats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      sent: Math.floor(Math.random() * 100),
      opened: Math.floor(Math.random() * 80),
      clicked: Math.floor(Math.random() * 30),
    };
  }).reverse();
  
  // Get top clicked links (mock for now)
  const top_links = [
    { url: 'https://poultryco.net/profile', clicks: 45 },
    { url: 'https://poultryco.net/discover', clicks: 32 },
    { url: 'https://poultryco.net/messages', clicks: 28 },
  ];
  
  return {
    overview: campaign,
    performance,
    daily_stats,
    top_links,
  };
}

// Test Email
export async function sendTestEmail(
  templateId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  try {
    // Get template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (!template) {
      return { success: false, error: 'Template not found' };
    }
    
    // Add to queue with high priority
    const { error } = await supabase
      .from('email_queue')
      .insert({
        recipient_email: recipientEmail,
        recipient_id: null, // Test email, no user ID
        template_id: templateId,
        subject: '[TEST] ' + template.subject,
        html_body: template.html_body,
        text_body: template.text_body,
        priority: 10, // Highest priority
        scheduled_for: new Date().toISOString(),
        personalization_data: {
          full_name: 'Test User',
          profile_strength: '75',
          location_state: 'Maharashtra',
          unsubscribe_token: 'test-token',
        },
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send test email' 
    };
  }
}
