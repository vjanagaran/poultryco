import { apiClient } from './client';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  subscribed_topics: string[] | null;
  created_at: string;
  emails_sent: number;
  emails_opened: number;
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  subject: string;
  message: string;
  inquiry_type: string | null;
  status: string;
  priority: string;
  created_at: string;
}

export interface EarlyAccessSignup {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string | null;
  company_name: string | null;
  country: string | null;
  interested_in: string[] | null;
  message: string | null;
  status: string;
  priority: string;
  created_at: string;
  source: string | null;
}

// Newsletter Subscribers
export async function getNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<NewsletterSubscriber[]>(`/forms/newsletter/subscribers${query}`);
}

export async function updateNewsletterSubscriberStatus(id: string, status: string): Promise<NewsletterSubscriber> {
  return apiClient.patch<NewsletterSubscriber>(`/forms/newsletter/subscribers/${id}/status`, { status });
}

// Contact Submissions
export async function getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<ContactSubmission[]>(`/forms/contact/submissions${query}`);
}

export async function updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission> {
  return apiClient.patch<ContactSubmission>(`/forms/contact/submissions/${id}/status`, { status });
}

// Early Access Signups
export async function getEarlyAccessSignups(status?: string): Promise<EarlyAccessSignup[]> {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<EarlyAccessSignup[]>(`/forms/early-access/signups${query}`);
}

export async function updateEarlyAccessSignupStatus(id: string, status: string): Promise<EarlyAccessSignup> {
  return apiClient.patch<EarlyAccessSignup>(`/forms/early-access/signups/${id}/status`, { status });
}

export async function deleteEarlyAccessSignup(id: string): Promise<void> {
  await apiClient.delete(`/forms/early-access/signups/${id}`);
}
