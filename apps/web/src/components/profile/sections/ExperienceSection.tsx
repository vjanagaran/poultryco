'use client';

import { useMemo, useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExperienceSectionProps {
  profile: any;
  isOwner: boolean;
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'seasonal', label: 'Seasonal' },
];

export function ExperienceSection({ profile, isOwner }: ExperienceSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);

  const experiences = profile.experiences || [];
  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return dateB - dateA;
      }),
    [experiences],
  );

  if (!experiences.length && !isOwner) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add experience
            </button>
          )}
        </div>

        {sortedExperiences.length > 0 ? (
          <div className="space-y-4">
            {sortedExperiences.map((exp: any) => (
              <div key={exp.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xl">💼</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-700">{exp.company_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{exp.employment_type?.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                  </p>
                  {exp.description && (
                    <p className="mt-2 text-gray-600 text-sm whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setEditingExperience(exp)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <DeleteExperienceButton experienceId={exp.id} companyName={exp.company_name} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              + Add your work experience
            </button>
          )
        )}
      </div>

      {showAddModal && (
        <ExperienceModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingExperience && (
        <ExperienceModal
          experience={editingExperience}
          onClose={() => setEditingExperience(null)}
        />
      )}
    </>
  );
}

// Helper function to format dates
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Experience Modal Component
function ExperienceModal({ experience, onClose }: { experience?: any; onClose: () => void }) {
  const { user } = useAuth();
  const { fetchProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company_name: experience?.company_name || '',
    employment_type: experience?.employment_type || EMPLOYMENT_TYPES[0].value,
    location: experience?.location || '',
    start_date: experience?.start_date?.substring(0, 7) || '', // YYYY-MM format
    end_date: experience?.end_date?.substring(0, 7) || '',
    is_current: experience?.is_current || false,
    description: experience?.description || '',
    key_achievements: Array.isArray(experience?.key_achievements)
      ? experience.key_achievements.join('\n')
      : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const supabase = createClient();

    try {
      const data = {
        profile_id: user.id,
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        employment_type: formData.employment_type,
        location: formData.location.trim() || null,
        is_current: formData.is_current,
        start_date: formData.start_date ? `${formData.start_date}-01` : null,
        end_date: formData.is_current ? null : formData.end_date ? `${formData.end_date}-01` : null,
        description: formData.description.trim() || null,
        key_achievements: formData.key_achievements
          .split('\n')
          .map((item: string) => item.trim())
          .filter(Boolean),
      };

      if (experience) {
        // Update existing
        const { error } = await supabase
          .from('profile_experience')
          .update(data)
          .eq('id', experience.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('profile_experience')
          .insert(data);

        if (error) throw error;
      }

      await fetchProfile();
      onClose();
    } catch (error) {
      console.log('Error saving experience:', error);
      alert('Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {experience ? 'Edit Experience' : 'Add Experience'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., Poultry Farm Manager"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="E.g., Green Valley Farms"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type *
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="E.g., Namakkal, Tamil Nadu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Current Job Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData({
                  ...formData,
                  is_current: isChecked,
                  end_date: isChecked ? '' : formData.end_date, // Clear end date when checked
                });
              }}
              className="w-4 h-4 text-green-600 rounded"
            />
            <label htmlFor="is_current" className="text-sm text-gray-700">
              I currently work here
            </label>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="month"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    !formData.start_date ? 'text-transparent' : ''
                  }`}
                />
                {!formData.start_date && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    MM YYYY
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date {!formData.is_current && '*'}
              </label>
              <div className="relative">
                <input
                  type="month"
                  value={formData.is_current ? '' : formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  required={!formData.is_current}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 ${
                    !formData.end_date || formData.is_current ? 'text-transparent' : ''
                  }`}
                />
                {!formData.end_date && !formData.is_current && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    MM YYYY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your responsibilities and achievements..."
              rows={5}
              maxLength={300}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/300 characters</p>
          </div>

          {/* Key Achievements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Achievements (one per line)
            </label>
            <textarea
              value={formData.key_achievements}
              onChange={(e) => setFormData({ ...formData, key_achievements: e.target.value })}
              placeholder="Eg: ed broiler mortality by 12%"
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Optional, helps highlight measurable results</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Experience Button Component
function DeleteExperienceButton({ experienceId, companyName }: { experienceId: string; companyName: string }) {
  const { fetchProfile } = useProfile();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete your experience at ${companyName}?`)) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profile_experience')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;

      await fetchProfile();
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
