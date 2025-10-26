'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onMemberInvited: () => void;
}

export function InviteTeamMemberModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  onMemberInvited,
}: InviteTeamMemberModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
    if (!isOpen) return;
    
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const supabase = createClient();

        // Search for users by name or email
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, profile_slug, headline, profile_photo_url, email')
          .or(`full_name.ilike.%${searchQuery}%,profile_slug.ilike.%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        // Filter out users who are already team members
        const { data: existingMembers } = await supabase
          .from('business_team_members')
          .select('profile_id')
          .eq('business_profile_id', businessId);

        const existingIds = new Set(existingMembers?.map((m) => m.profile_id) || []);
        const filteredResults = data?.filter((user) => !existingIds.has(user.id)) || [];

        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, businessId, isOpen]);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Add team member
      const { error: memberError } = await supabase
        .from('business_team_members')
        .insert({
          business_profile_id: businessId,
          profile_id: selectedUser.id,
          role_title: formData.role_title,
          department: formData.department || null,
          employment_type: formData.employment_type,
          is_admin: formData.is_admin,
          can_post_updates: formData.can_post_updates,
          can_manage_products: formData.can_manage_products,
          can_manage_jobs: formData.can_manage_jobs,
          can_view_analytics: formData.can_view_analytics,
          show_on_page: formData.show_on_page,
        });

      if (memberError) throw memberError;

      // TODO: Send notification to user
      // await createNotification(selectedUser.id, 'team_invitation', { businessId, businessName });

      // Success!
      onMemberInvited();
      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      alert(error.message || 'Failed to invite team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleInvite} className="p-6 space-y-6">
          {/* Search User */}
          {!selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search PoultryCo User <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              
              {/* Search Results */}
              {searching && (
                <div className="mt-2 text-sm text-gray-500">Searching...</div>
              )}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                        {user.profile_photo_url ? (
                          <Image
                            src={user.profile_photo_url}
                            alt={user.full_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{user.full_name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {user.headline || `@${user.profile_slug}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="mt-2 text-sm text-gray-500">No users found</div>
              )}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                  {selectedUser.profile_photo_url ? (
                    <Image
                      src={selectedUser.profile_photo_url}
                      alt={selectedUser.full_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {selectedUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{selectedUser.full_name}</h4>
                  <p className="text-sm text-gray-600 truncate">{selectedUser.headline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Role Details (only show if user is selected) */}
          {selectedUser && (
            <>
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
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser || !formData.role_title}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Inviting...' : 'Invite Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

