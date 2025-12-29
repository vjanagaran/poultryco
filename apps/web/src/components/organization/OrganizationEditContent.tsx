'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/api/organizations';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface OrganizationEditContentProps {
  slug: string;
}

export function OrganizationEditContent({ slug }: OrganizationEditContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    about: '',
    mission: '',
    vision: '',
    founded_year: '',
    website_url: '',
    headquarters_address: '',
    headquarters_city: '',
    headquarters_state: '',
    country: 'India',
    phone: '',
    email: '',
  });

  useEffect(() => {
    async function fetchOrganization() {
      try {
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch organization via API
        const orgData = await getOrganizationBySlug(slug);

        // Check if user is owner
        if (orgData.ownerId !== user.id) {
          router.push(`/org/${slug}`);
          return;
        }

        setOrganization(orgData);
        setFormData({
          organization_name: orgData.name || '',
          organization_type: orgData.organizationTypeId || '',
          about: orgData.about || '',
          mission: orgData.mission || '',
          vision: orgData.vision || '',
          founded_year: orgData.foundedYear?.toString() || '',
          website_url: orgData.websiteUrl || '',
          headquarters_address: '', // TODO: Get from contact
          headquarters_city: '',
          headquarters_state: '',
          country: 'India',
          phone: '',
          email: '',
        });
      } catch (error) {
        console.error('Error fetching organization:', error);
        router.push('/directory');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [slug, router, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update organization via API
      await apiClient.put(`/organizations/${organization.id}`, {
        name: formData.organization_name,
        organizationTypeId: formData.organization_type,
        about: formData.about || null,
        mission: formData.mission || null,
        vision: formData.vision || null,
        foundedYear: formData.founded_year ? parseInt(formData.founded_year) : null,
        websiteUrl: formData.website_url || null,
        contact: {
          headquartersAddress: formData.headquarters_address || null,
          headquartersCity: formData.headquarters_city || null,
          headquartersState: formData.headquarters_state || null,
          country: formData.country,
          phone: formData.phone || null,
          email: formData.email || null,
        },
      });

      // Redirect back to profile
      router.push(`/org/${organization.slug}`);
    } catch (error: any) {
      console.error('Error saving organization:', error);
      alert(error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Organization</h1>
            <button
              onClick={() => router.push(`/org/${organization.organization_slug}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About
                  </label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission
                    </label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision
                    </label>
                    <textarea
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.headquarters_address}
                    onChange={(e) => setFormData({ ...formData, headquarters_address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.headquarters_city}
                      onChange={(e) => setFormData({ ...formData, headquarters_city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.headquarters_state}
                      onChange={(e) => setFormData({ ...formData, headquarters_state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => router.push(`/org/${organization.organization_slug}`)}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

