'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getNdpCategories, getStakeholderSegments, createContentTopic, type NdpCategory, type StakeholderSegment } from '@/lib/api/marketing';

export default function NewTopicPage() {
  const router = useRouter();

  const [ndpCategories, setNdpCategories] = useState<NdpCategory[]>([]);
  const [segments, setSegments] = useState<StakeholderSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ndp_category_id: '',
    target_outcome: '',
    key_message: '',
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLookupData();
  }, []);

  async function fetchLookupData() {
    try {
      const [categories, segmentsData] = await Promise.all([
        getNdpCategories(),
        getStakeholderSegments(),
      ]);

      setNdpCategories(categories);
      if (categories.length > 0) {
        setFormData(prev => ({ ...prev, ndp_category_id: categories[0].id }));
      }
      setSegments(segmentsData);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Create topic via API
      const topicData = await createContentTopic({
        ...formData,
        ndp_category_id: formData.ndp_category_id || undefined,
      });

      // TODO: Update segment mappings when API supports it
      // For now, segment mappings will need to be handled separately

      router.push('/marketing/topics');
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setError(err.message || 'Failed to create topic');
    } finally {
      setSaving(false);
    }
  };

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add NDP Topic</h1>
          <p className="mt-2 text-gray-600">
            Create a new content topic based on the Need-Desire-Pain framework
          </p>
        </div>
        <Link
          href="/marketing/topics"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., High Mortality Rate in Broiler Farms"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Describe this topic and why it matters to your audience..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
          />
        </div>

        {/* NDP Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NDP Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.ndp_category_id}
            onChange={(e) =>
              setFormData({ ...formData, ndp_category_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
          >
            <option value="">Select a category</option>
            {ndpCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Classify this topic as a Need, Desire, Pain point, etc.
          </p>
        </div>

        {/* Target Segments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Segments
          </label>
          <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
            {segments.length === 0 ? (
              <p className="text-sm text-gray-500">Loading segments...</p>
            ) : (
              segments.map((segment) => (
                <label
                  key={segment.id}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSegments.includes(segment.id)}
                    onChange={() => toggleSegment(segment.id)}
                    className="mt-1 w-4 h-4 text-poultryco-green border-gray-300 rounded focus:ring-poultryco-green"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {segment.name}
                    </div>
                    {segment.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {segment.description}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Select all audience segments this topic is relevant to
          </p>
        </div>

        {/* Target Outcome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Outcome
          </label>
          <textarea
            rows={3}
            placeholder="What action or result do you want from content on this topic?"
            value={formData.target_outcome}
            onChange={(e) =>
              setFormData({ ...formData, target_outcome: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
          />
        </div>

        {/* Key Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Message
          </label>
          <textarea
            rows={3}
            placeholder="The core message or insight to communicate about this topic..."
            value={formData.key_message}
            onChange={(e) =>
              setFormData({ ...formData, key_message: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="w-4 h-4 text-poultryco-green border-gray-300 rounded focus:ring-poultryco-green"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active (available for content creation)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/marketing/topics"
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
}
