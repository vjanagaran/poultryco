'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SkillsSectionProps {
  profile: any;
  isOwner: boolean;
}

export function SkillsSection({ profile, isOwner }: SkillsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const skills = profile.skills || [];

  if (!skills.length && !isOwner) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Skills</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add skill
            </button>
          )}
        </div>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: any) => (
              <div
                key={skill.id}
                className="group relative px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 text-sm font-medium transition-colors"
              >
                <span>{skill.skill_name}</span>
                {(skill.endorsements_count || 0) > 0 && (
                  <span className="ml-2 text-xs text-gray-600">
                    • {skill.endorsements_count || 0}
                  </span>
                )}
                {isOwner && (
                  <DeleteSkillButton skillId={skill.id} skillName={skill.skill_name} />
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
              + Add skills to showcase your expertise
            </button>
          )
        )}
      </div>

      {showAddModal && (
        <SkillModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}

// Skill Modal Component
function SkillModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { fetchProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [suggestions] = useState([
    'Poultry Farming',
    'Veterinary Care',
    'Feed Management',
    'Disease Prevention',
    'Biosecurity',
    'Hatchery Management',
    'Broiler Management',
    'Layer Management',
    'Quality Control',
    'Supply Chain Management',
    'Farm Management',
    'Animal Nutrition',
    'Business Management',
    'Sales & Marketing',
    'Financial Planning',
    'Team Leadership',
    'Record Keeping',
    'Equipment Maintenance',
    'Vaccination Programs',
    'Breeder Management',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !skillName.trim()) return;

    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profile_skills')
        .insert({
          profile_id: user.id,
          skill_name: skillName.trim(),
          // endorsements_count will be added after migration 58
        });

      if (error) throw error;

      await fetchProfile();
      onClose();
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSkillName(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Add Skill</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="E.g., Poultry Farming"
              required
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{skillName.length}/100 characters</p>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Popular Skills (click to add):
            </p>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
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
              disabled={saving || !skillName.trim()}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Skill Button Component
function DeleteSkillButton({ skillId, skillName }: { skillId: string; skillName: string }) {
  const { fetchProfile } = useProfile();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Remove "${skillName}" from your skills?`)) {
      return;
    }

    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('profile_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      await fetchProfile();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white disabled:opacity-50"
      title="Remove skill"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
