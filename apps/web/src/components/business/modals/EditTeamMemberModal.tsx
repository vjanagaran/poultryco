'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  businessId: string;
  onMemberUpdated: () => void;
}

export function EditTeamMemberModal({
  isOpen,
  onClose,
  member,
  businessId,
  onMemberUpdated,
}: EditTeamMemberModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [formData, setFormData] = useState({
    role_title: '',
    department: '',
    employment_type: 'full_time' as string,
    is_admin: false,
    can_post_updates: true,
    can_manage_products: false,
    can_manage_jobs: false,
    can_view_analytics: false,
    show_on_page: true,
  });

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        role_title: member.role_title || '',
        department: member.department || '',
        employment_type: member.employment_type || 'full_time',
        is_admin: member.is_admin || false,
        can_post_updates: member.can_post_updates || false,
        can_manage_products: member.can_manage_products || false,
        can_manage_jobs: member.can_manage_jobs || false,
        can_view_analytics: member.can_view_analytics || false,
        show_on_page: member.show_on_page !== false,
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleRemove = async () => {
    if (!confirm(`Remove ${member.profile.full_name} from team?`)) {
      return;
    }

    setRemoving(true);
    try {
      // Delete team member via API
      await apiClient.delete(`/businesses/${businessId}/team/${member.id}`);

      onMemberUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      alert(error.message || 'Failed to remove team member');
    } finally {
      setRemoving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update team member via API
      await apiClient.put(`/businesses/${businessId}/team/${member.id}`, {
        roleTitle: formData.role_title,
        department: formData.department || null,
        employmentType: formData.employment_type,
        isAdmin: formData.is_admin,
        canPostUpdates: formData.can_post_updates,
        canManageProducts: formData.can_manage_products,
        canManageJobs: formData.can_manage_jobs,
        canViewAnalytics: formData.can_view_analytics,
        showOnPage: formData.show_on_page,
      });

      onMemberUpdated();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error updating team member:', error);
      alert(error.message || 'Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Team Member Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                {member.profile.profile_photo_url ? (
                  <Image
                    src={member.profile.profile_photo_url}
                    alt={member.profile.full_name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {member.profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{member.profile.full_name}</h4>
                <p className="text-sm text-gray-600 truncate">{member.profile.headline}</p>
              </div>
            </div>
          </div>

          {/* Role Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.role_title}
              onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
              placeholder="e.g., Sales Manager, Technical Consultant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Department & Employment Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Sales, Operations"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Admin</strong> - Full access to manage business
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_post_updates}
                  onChange={(e) => setFormData({ ...formData, can_post_updates: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Can post updates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_manage_products}
                  onChange={(e) => setFormData({ ...formData, can_manage_products: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Can manage products</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_manage_jobs}
                  onChange={(e) => setFormData({ ...formData, can_manage_jobs: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Can manage job postings</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.can_view_analytics}
                  onChange={(e) => setFormData({ ...formData, can_view_analytics: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Can view analytics</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.show_on_page}
                  onChange={(e) => setFormData({ ...formData, show_on_page: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Show on business page</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading || removing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {removing ? 'Removing...' : 'Remove from Team'}
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || removing}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || removing || !formData.role_title}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

