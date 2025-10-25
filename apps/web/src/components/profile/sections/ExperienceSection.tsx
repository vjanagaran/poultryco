'use client';

import { useState } from 'react';

interface ExperienceSectionProps {
  profile: any;
  isOwner: boolean;
}

export function ExperienceSection({ profile, isOwner }: ExperienceSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const experiences = profile.experiences || [];

  if (!experiences.length && !isOwner) return null;

  return (
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

      {experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp: any, index: number) => (
            <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xl">💼</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                <p className="text-gray-700">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                </p>
                {exp.description && (
                  <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>
                )}
              </div>
              {isOwner && (
                <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
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
  );
}

