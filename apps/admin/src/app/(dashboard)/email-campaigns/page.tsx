'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getEmailCampaigns,
  deleteEmailCampaign,
  type EmailCampaign,
} from '@/lib/api/email-campaigns';

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getEmailCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await deleteEmailCampaign(id);
      await loadCampaigns();
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-purple-100 text-purple-700',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const getCampaignIcon = (type: string) => {
    const icons = {
      drip: '💧',
      behavioral: '🎯',
      milestone: '🏆',
      're-engagement': '🔄',
      educational: '📚',
      promotional: '📢',
    };
    return icons[type as keyof typeof icons] || '📧';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage automated email campaigns and templates</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/email-campaigns/templates"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            📝 Templates
          </Link>
          <Link
            href="/email-campaigns/new"
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Campaigns</h3>
            <span className="text-2xl">📧</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <span className="text-2xl">🟢</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Scheduled</h3>
            <span className="text-2xl">⏰</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {campaigns.filter(c => c.status === 'scheduled').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Sent</h3>
            <span className="text-2xl">📨</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {campaigns.reduce((sum, c) => sum + c.total_sent, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">📭</span>
                    <p>No campaigns yet</p>
                    <Link
                      href="/email-campaigns/new"
                      className="mt-4 text-green-600 hover:text-green-700"
                    >
                      Create your first campaign →
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getCampaignIcon(campaign.type)}</div>
                      <div>
                        <Link
                          href={`/email-campaigns/${campaign.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-600"
                        >
                          {campaign.name}
                        </Link>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{campaign.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-gray-500">Sent:</span>{' '}
                          <span className="font-medium">{campaign.total_sent.toLocaleString()}</span>
                        </div>
                        {campaign.total_sent > 0 && (
                          <>
                            <div>
                              <span className="text-gray-500">Open:</span>{' '}
                              <span className="font-medium">
                                {((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Click:</span>{' '}
                              <span className="font-medium">
                                {((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.start_date && (
                      <div>
                        Start: {new Date(campaign.start_date).toLocaleDateString()}
                      </div>
                    )}
                    {campaign.end_date && (
                      <div>
                        End: {new Date(campaign.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/email-campaigns/${campaign.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/email-campaigns/${campaign.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
