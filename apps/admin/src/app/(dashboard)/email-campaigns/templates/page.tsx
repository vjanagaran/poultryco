'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getEmailTemplates,
  deleteEmailTemplate,
  sendTestEmail,
  type EmailTemplate,
} from '@/lib/api/email-campaigns';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmailModal, setTestEmailModal] = useState<{
    open: boolean;
    templateId?: string;
    templateName?: string;
  }>({ open: false });
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (_err) {
      console.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await deleteEmailTemplate(id);
      await loadTemplates();
    } catch (_err) {
      alert('Failed to delete template');
    }
  };

  const handleSendTest = async () => {
    if (!testEmailModal.templateId || !testEmail) return;
    
    setSendingTest(true);
    try {
      const result = await sendTestEmail(testEmailModal.templateId, testEmail);
      if (result.success) {
        alert('Test email queued successfully!');
        setTestEmailModal({ open: false });
        setTestEmail('');
      } else {
        alert(result.error || 'Failed to send test email');
      }
    } catch (_err) {
      alert('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      welcome: '👋',
      onboarding: '🎯',
      engagement: '💬',
      retention: '🔄',
      network: '🤝',
      content: '📝',
      achievement: '🏆',
      educational: '📚',
      event: '📅',
      digest: '📊',
      system: '⚙️',
    };
    return icons[category as keyof typeof icons] || '📧';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      welcome: 'bg-blue-100 text-blue-700',
      onboarding: 'bg-green-100 text-green-700',
      engagement: 'bg-purple-100 text-purple-700',
      retention: 'bg-yellow-100 text-yellow-700',
      network: 'bg-indigo-100 text-indigo-700',
      content: 'bg-pink-100 text-pink-700',
      achievement: 'bg-orange-100 text-orange-700',
      educational: 'bg-teal-100 text-teal-700',
      event: 'bg-red-100 text-red-700',
      digest: 'bg-gray-100 text-gray-700',
      system: 'bg-gray-100 text-gray-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Manage reusable email templates for campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/email-campaigns"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Campaigns
          </Link>
          <Link
            href="/email-campaigns/templates/new"
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            + New Template
          </Link>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <span className="text-4xl mb-2 block">📭</span>
            <p className="text-gray-500">No templates yet</p>
            <Link
              href="/email-campaigns/templates/new"
              className="mt-4 inline-block text-green-600 hover:text-green-700"
            >
              Create your first template →
            </Link>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{getCategoryIcon(template.category)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>
              
              {/* Stats */}
              <div className="px-6 py-4 bg-gray-50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Sent</p>
                  <p className="font-semibold text-gray-900">{template.total_sent}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Opened</p>
                  <p className="font-semibold text-green-600">
                    {template.total_sent > 0 
                      ? `${((template.total_opened / template.total_sent) * 100).toFixed(0)}%`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clicked</p>
                  <p className="font-semibold text-blue-600">
                    {template.total_opened > 0 
                      ? `${((template.total_clicked / template.total_opened) * 100).toFixed(0)}%`
                      : '-'}
                  </p>
                </div>
              </div>
              
              {/* Preview */}
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Subject Line:</p>
                <p className="text-sm text-gray-600 italic">{template.subject}</p>
              </div>
              
              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <Link
                    href={`/email-campaigns/templates/${template.id}/edit`}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setTestEmailModal({
                      open: true,
                      templateId: template.id,
                      templateName: template.name,
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Send Test
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                <span className={`text-xs ${template.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                  {template.is_active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Email Modal */}
      {testEmailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Send Test Email
            </h3>
            <p className="text-gray-600 mb-4">
              Testing template: <strong>{testEmailModal.templateName}</strong>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setTestEmailModal({ open: false });
                  setTestEmail('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={sendingTest}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={!testEmail || sendingTest}
              >
                {sendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
