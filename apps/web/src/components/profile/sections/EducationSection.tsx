'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EducationSectionProps {
  profile: any;
  isOwner: boolean;
}
interface EducationForm {
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
  description: string;
}

export function EducationSection({ profile, isOwner }: EducationSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

  const educations = profile.education || [];

  if (!educations.length && !isOwner) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Education</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add education
            </button>
          )}
        </div>

        {educations.length > 0 ? (
          <div className="space-y-4">
            {educations.map((edu: any) => (
              <div key={edu.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xl">🎓</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{edu.institution_name}</h3>
                  <p className="text-gray-700">{edu.degree}</p>
                  {edu.field_of_study && (
                    <p className="text-gray-600 text-sm">{edu.field_of_study}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {edu.start_year} - {edu.is_current ? 'Present' : (edu.end_year || 'Present')}
                  </p>
                  {edu.description && (
                    <p className="mt-2 text-gray-600 text-sm whitespace-pre-line">{edu.description}</p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => setEditingEducation(edu)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <DeleteEducationButton educationId={edu.id} institutionName={edu.institution_name} />
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
              + Add your education
            </button>
          )
        )}
      </div>

      {showAddModal && (
        <EducationModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingEducation && (
        <EducationModal
          education={editingEducation}
          onClose={() => setEditingEducation(null)}
        />
      )}
    </>
  );
}

// Education Modal Component
function EducationModal({ education, onClose }: { education?: any; onClose: () => void }) {
  const { user } = useAuth();
  const { fetchProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: education?.institution_name || '',
    degree: education?.degree || '',
    field_of_study: education?.field_of_study || '',
    start_year: education?.start_year || '',
    end_year: education?.end_year || '',
    is_ongoing: education?.is_current || false,
    description: education?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const supabase = createClient();

    try {
      const data = {
        profile_id: user.id,
        ...formData,
        end_year: formData.is_ongoing ? null : formData.end_year,
      };

      if (education) {
        // Update existing
        const { error } = await supabase
          .from('profile_education')
          .update(data)
          .eq('id', education.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('profile_education')
          .insert(data);

        if (error) throw error;
      }

      await fetchProfile();
      onClose();
    } catch (error) {
      console.log('Error saving education:', error);
      alert('Failed to save education');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {education ? 'Edit Education' : 'Add Education'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Institution Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School/University *
            </label>
            <input
              type="text"
              value={formData.institution_name}
              onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
              placeholder="E.g., Tamil Nadu Veterinary and Animal Sciences University"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree *
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="E.g., Bachelor of Veterinary Science"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <input
              type="text"
              value={formData.field_of_study}
              onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
              placeholder="E.g., Veterinary Medicine, Poultry Science"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Currently Studying Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_ongoing}
              onChange={(e) => setFormData({ ...formData, is_ongoing: e.target.checked })}
              className="w-4 h-4 text-green-600 rounded"
            />
            <label htmlFor="is_ongoing" className="text-sm text-gray-700">
              I am currently studying here
            </label>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Year *
              </label>
              <input
                type="number"
                value={formData.start_year}
                onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                placeholder="2018"
                min="1950"
                max={new Date().getFullYear()}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Year {!formData.is_ongoing && '*'}
              </label>
              <input
                type="number"
                value={formData.end_year}
                onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                placeholder="2022"
                min="1950"
                max={new Date().getFullYear() + 10}
                disabled={formData.is_ongoing}
                required={!formData.is_ongoing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Activities, awards, notable coursework..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
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

// Delete Education Button Component
function DeleteEducationButton({ educationId, institutionName }: { educationId: string; institutionName: string }) {
  const { fetchProfile } = useProfile();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete your education at ${institutionName}?`)) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profile_education')
        .delete()
        .eq('id', educationId);

      if (error) throw error;

      await fetchProfile();
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education');
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
