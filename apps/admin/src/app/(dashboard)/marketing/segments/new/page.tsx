'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewSegmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segment_size_estimate: '',
    key_characteristics: '',
    communication_preferences: '',
    priority_level: 5,
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error: insertError } = await supabase
        .from('stakeholder_segments')
        .insert({
          name: formData.name,
          description: formData.description || null,
          segment_size_estimate: formData.segment_size_estimate
            ? parseInt(formData.segment_size_estimate)
            : null,
          key_characteristics: formData.key_characteristics || null,
          communication_preferences: formData.communication_preferences || null,
          priority_level: formData.priority_level,
          is_active: formData.is_active,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push('/marketing/segments');
    } catch (err: any) {
      console.error('Error creating segment:', err);
      setError(err.message || 'Failed to create segment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/marketing/segments"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Back to Segments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">New Stakeholder Segment</h1>
        <p className="text-gray-600 mt-2">
          Define a target audience segment for your marketing content
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., Commercial Poultry Farmers"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The name of the target audience segment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Brief description of this segment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment Size Estimate
            </label>
            <input
              type="number"
              value={formData.segment_size_estimate}
              onChange={(e) => updateFormField('segment_size_estimate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Estimated audience size"
            />
            <p className="mt-1 text-xs text-gray-500">
              Approximate number of people in this segment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority_level}
              onChange={(e) => updateFormField('priority_level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Higher priority segments get more focus (1 = lowest, 10 = highest)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => updateFormField('is_active', e.target.checked)}
              className="rounded border-gray-300 text-poultryco-green focus:ring-poultryco-green"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>

        {/* Characteristics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Key Characteristics</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Characteristics
            </label>
            <textarea
              value={formData.key_characteristics}
              onChange={(e) => updateFormField('key_characteristics', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., Tech-savvy, prefers online learning, active on LinkedIn..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Describe the typical characteristics of this segment
            </p>
          </div>
        </div>

        {/* Communication */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Communication Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Communication Channels
            </label>
            <textarea
              value={formData.communication_preferences}
              onChange={(e) => updateFormField('communication_preferences', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., Email newsletters, LinkedIn posts, webinars..."
            />
            <p className="mt-1 text-xs text-gray-500">
              How this segment prefers to receive information
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/marketing/segments"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.name}
            className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Segment'}
          </button>
        </div>
      </form>
    </div>
  );
}

