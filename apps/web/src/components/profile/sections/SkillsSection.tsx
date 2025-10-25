'use client';

import { useState } from 'react';

interface SkillsSectionProps {
  profile: any;
  isOwner: boolean;
}

export function SkillsSection({ profile, isOwner }: SkillsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const skills = profile.skills || [];

  if (!skills.length && !isOwner) return null;

  return (
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
          {skills.map((skill: any, index: number) => (
            <div
              key={index}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 text-sm font-medium transition-colors"
            >
              {skill.name}
              {skill.endorsements_count > 0 && (
                <span className="ml-2 text-xs text-gray-600">
                  • {skill.endorsements_count}
                </span>
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
  );
}

