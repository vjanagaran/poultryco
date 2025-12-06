'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getStakeholderSegmentById, updateStakeholderSegment, deleteStakeholderSegment, type StakeholderSegment } from '@/lib/api/marketing';

// Types imported from API

export default function SegmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const segmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [segment, setSegment] = useState<StakeholderSegment | null>(null);

  // Form state
  const [formData, setFormData] = useState<any>({});

  // Stats
  const [stats, setStats] = useState({
    total_topics: 0,
    total_content: 0,
    total_pillars: 0,
  });

  useEffect(() => {
    fetchData();
  }, [segmentId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch segment
      const segmentData = await getStakeholderSegmentById(segmentId);
      setSegment(segmentData);
      setFormData(segmentData);

      // TODO: Fetch stats when API supports it
      setStats({
        total_topics: 0,
        total_pillars: 0,
        total_content: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateStakeholderSegment(segmentId, {
        name: formData.name,
        description: formData.description,
        segment_size_estimate: formData.segment_size_estimate,
        key_characteristics: formData.key_characteristics,
        communication_preferences: formData.communication_preferences,
        priority_level: formData.priority_level,
        is_active: formData.is_active,
      });

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this segment? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await deleteStakeholderSegment(segmentId);
      router.push('/marketing/segments');
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Failed to delete segment. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Segment not found</h2>
        <Link href="/marketing/segments" className="text-poultryco-green hover:underline">
          ← Back to Segments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/segments"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Segments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{segment.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                segment.is_active
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {segment.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(segment.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(segment);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Topics</div>
          <div className="text-2xl font-bold text-blue-900">{stats.total_topics}</div>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">Pillars</div>
          <div className="text-2xl font-bold text-purple-900">{stats.total_pillars}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Content</div>
          <div className="text-2xl font-bold text-green-900">{stats.total_content}</div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment Size Estimate
                  </label>
                  <input
                    type="number"
                    value={formData.segment_size_estimate || ''}
                    onChange={(e) =>
                      updateFormField('segment_size_estimate', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="Estimated audience size"
                  />
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
              </>
            ) : (
              <>
                {segment.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <p className="text-gray-900 whitespace-pre-wrap">{segment.description}</p>
                  </div>
                )}

                {segment.segment_size_estimate && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Estimated Audience Size
                    </div>
                    <p className="text-gray-900">
                      {segment.segment_size_estimate.toLocaleString()} people
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Priority Level</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-poultryco-green rounded-full h-2"
                        style={{ width: `${segment.priority_level * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {segment.priority_level}/10
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Characteristics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Key Characteristics</h2>

            {editing ? (
              <div>
                <textarea
                  value={formData.key_characteristics || ''}
                  onChange={(e) => updateFormField('key_characteristics', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  placeholder="e.g., Tech-savvy, prefers online learning, active on LinkedIn..."
                />
              </div>
            ) : (
              <>
                {segment.key_characteristics ? (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {segment.key_characteristics}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No characteristics defined</p>
                )}
              </>
            )}
          </div>

          {/* Communication Preferences */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Communication Preferences</h2>

            {editing ? (
              <div>
                <textarea
                  value={formData.communication_preferences || ''}
                  onChange={(e) => updateFormField('communication_preferences', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  placeholder="e.g., Email newsletters, LinkedIn posts, webinars..."
                />
              </div>
            ) : (
              <>
                {segment.communication_preferences ? (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {segment.communication_preferences}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No preferences defined</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>

            <Link
              href={`/marketing/topics?segment=${segmentId}`}
              className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              View Topics
            </Link>

            <Link
              href={`/marketing/pillars?segment=${segmentId}`}
              className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              View Pillars
            </Link>

            <Link
              href={`/marketing/content?segment=${segmentId}`}
              className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              View Content
            </Link>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600">Created</div>
                <div className="font-medium text-gray-900">
                  {new Date(segment.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

