'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const TEMPLATE_CATEGORIES = [
  { value: 'welcome', label: 'Welcome', icon: '👋' },
  { value: 'onboarding', label: 'Onboarding', icon: '🚀' },
  { value: 'engagement', label: 'Engagement', icon: '💬' },
  { value: 'retention', label: 'Retention', icon: '🔄' },
  { value: 'network', label: 'Network', icon: '🤝' },
  { value: 'content', label: 'Content', icon: '📝' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'event', label: 'Event', icon: '📅' },
  { value: 'digest', label: 'Digest', icon: '📰' },
  { value: 'system', label: 'System', icon: '⚙️' },
];

const USER_SEGMENTS = [
  { value: 'new', label: 'New Users (< 7 days)' },
  { value: 'inactive', label: 'Inactive Users (> 30 days)' },
  { value: 'active', label: 'Active Users' },
  { value: 'power', label: 'Power Users' },
];

const VARIABLE_TAGS = [
  { tag: '{{full_name}}', description: 'User\'s full name' },
  { tag: '{{first_name}}', description: 'User\'s first name' },
  { tag: '{{email}}', description: 'User\'s email' },
  { tag: '{{profile_strength}}', description: 'Profile completion %' },
  { tag: '{{current_date}}', description: 'Current date' },
  { tag: '{{current_year}}', description: 'Current year' },
];

const TEMPLATE_EXAMPLES = {
  welcome: {
    subject: 'Welcome to PoultryCo, {{first_name}}! 🐔',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .content { background: #f8f9fa; border-radius: 8px; padding: 30px; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #1f2937; margin: 0;">Welcome to PoultryCo! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>We're thrilled to have you join the PoultryCo community - the professional network built exclusively for the poultry industry!</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile to help others find and connect with you</li>
        <li>Explore and connect with industry professionals</li>
        <li>Share your knowledge and experiences</li>
        <li>Discover business opportunities</li>
      </ul>
      <center>
        <a href="https://poultryco.in/me" class="button">Complete Your Profile</a>
      </center>
      <p>If you have any questions, feel free to reach out to us at support@poultryco.in</p>
      <p>Best regards,<br>The PoultryCo Team</p>
    </div>
  </div>
</body>
</html>`,
    text_body: `Welcome to PoultryCo, {{first_name}}!

We're thrilled to have you join the PoultryCo community - the professional network built exclusively for the poultry industry!

Here's what you can do next:
- Complete your profile to help others find and connect with you
- Explore and connect with industry professionals
- Share your knowledge and experiences
- Discover business opportunities

Complete your profile: https://poultryco.in/me

If you have any questions, feel free to reach out to us at support@poultryco.in

Best regards,
The PoultryCo Team`
  },
  onboarding: {
    subject: 'Complete your PoultryCo profile to unlock all features',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; margin: 20px 0; }
    .progress-fill { background: #10b981; height: 100%; border-radius: 4px; width: {{profile_strength}}%; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hi {{first_name}}, your profile is {{profile_strength}}% complete!</h2>
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <p>A complete profile helps you:</p>
    <ul>
      <li>Get discovered by potential business partners</li>
      <li>Build trust and credibility</li>
      <li>Access all platform features</li>
    </ul>
    <a href="https://poultryco.in/me" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">Complete Profile</a>
  </div>
</body>
</html>`,
    text_body: `Hi {{first_name}}, your profile is {{profile_strength}}% complete!

A complete profile helps you:
- Get discovered by potential business partners
- Build trust and credibility
- Access all platform features

Complete your profile: https://poultryco.in/me`
  },
};

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    html_body: '',
    text_body: '',
    category: '',
    min_profile_strength: '',
    max_profile_strength: '',
    user_segment: [] as string[],
    is_active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSegmentChange = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      user_segment: prev.user_segment.includes(segment)
        ? prev.user_segment.filter(s => s !== segment)
        : [...prev.user_segment, segment]
    }));
  };

  const loadExample = (category: keyof typeof TEMPLATE_EXAMPLES) => {
    const example = TEMPLATE_EXAMPLES[category];
    setFormData(prev => ({
      ...prev,
      category,
      subject: example.subject,
      html_body: example.html_body,
      text_body: example.text_body,
    }));
  };

  const insertVariable = (field: 'subject' | 'html_body' | 'text_body', variable: string) => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData[field];
      const newText = text.substring(0, start) + variable + text.substring(end);
      setFormData(prev => ({ ...prev, [field]: newText }));
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.html_body || !formData.text_body || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      // Prepare data for insertion
      const templateData = {
        name: formData.name,
        subject: formData.subject,
        description: formData.description || null,
        html_body: formData.html_body,
        text_body: formData.text_body,
        category: formData.category,
        min_profile_strength: formData.min_profile_strength ? parseInt(formData.min_profile_strength) : null,
        max_profile_strength: formData.max_profile_strength ? parseInt(formData.max_profile_strength) : null,
        user_segment: formData.user_segment.length > 0 ? formData.user_segment : null,
        is_active: formData.is_active,
      };

      const { error } = await supabase
        .from('email_templates')
        .insert(templateData);

      if (error) throw error;

      router.push('/email-campaigns/templates');
    } catch (error: any) {
      console.error('Error creating template:', error);
      alert(error.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    const sampleData = {
      full_name: 'John Doe',
      first_name: 'John',
      email: 'john.doe@example.com',
      profile_strength: '75',
      current_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      current_year: new Date().getFullYear().toString(),
    };

    let previewHtml = formData.html_body;
    let previewSubject = formData.subject;

    Object.entries(sampleData).forEach(([key, value]) => {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      previewHtml = previewHtml.replace(pattern, value);
      previewSubject = previewSubject.replace(pattern, value);
    });

    return (
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Subject:</p>
          <p className="font-semibold">{previewSubject}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[600px]"
            title="Email Preview"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Email Template</h1>
          <p className="text-gray-600 mt-1">Design reusable email templates for campaigns</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {previewMode === 'edit' ? '👁️ Preview' : '✏️ Edit'}
          </button>
          <Link
            href="/email-campaigns/templates"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>

      {previewMode === 'edit' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Welcome Email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a category</option>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of when this template is used"
              />
            </div>
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Email Content</h2>
              {formData.category && TEMPLATE_EXAMPLES[formData.category as keyof typeof TEMPLATE_EXAMPLES] && (
                <button
                  type="button"
                  onClick={() => loadExample(formData.category as keyof typeof TEMPLATE_EXAMPLES)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Load Example
                </button>
              )}
            </div>

            {/* Variables Helper */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLE_TAGS.map(({ tag, description }) => (
                  <div key={tag} className="group relative">
                    <button
                      type="button"
                      onClick={() => insertVariable('subject', tag)}
                      className="px-3 py-1 bg-white text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-100"
                    >
                      {tag}
                    </button>
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Line *
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Welcome to PoultryCo, {{first_name}}!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Body *
                </label>
                <textarea
                  id="html_body"
                  name="html_body"
                  value={formData.html_body}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="HTML email content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Body *
                </label>
                <textarea
                  id="text_body"
                  name="text_body"
                  value={formData.text_body}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Plain text version..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Targeting Rules</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Profile Strength
                </label>
                <input
                  type="number"
                  name="min_profile_strength"
                  value={formData.min_profile_strength}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Profile Strength
                </label>
                <input
                  type="number"
                  name="max_profile_strength"
                  value={formData.max_profile_strength}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Segments
              </label>
              <div className="space-y-2">
                {USER_SEGMENTS.map(segment => (
                  <label key={segment.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.user_segment.includes(segment.value)}
                      onChange={() => handleSegmentChange(segment.value)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{segment.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Template is active
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link
              href="/email-campaigns/templates"
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Preview</h2>
          {renderPreview()}
        </div>
      )}
    </div>
  );
}
