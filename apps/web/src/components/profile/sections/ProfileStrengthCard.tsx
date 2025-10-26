'use client';

import { useMemo } from 'react';
import {
  calculateProfileStrength,
  getStrengthMessage,
  getStrengthColor,
} from '@/lib/profile/profileStrength';

interface ProfileStrengthCardProps {
  profile: any;
  isOwner: boolean;
}

export function ProfileStrengthCard({ profile, isOwner }: ProfileStrengthCardProps) {
  const strength = useMemo(() => calculateProfileStrength(profile), [profile]);
  const colors = useMemo(() => getStrengthColor(strength.percentage), [strength.percentage]);
  const message = useMemo(() => getStrengthMessage(strength.percentage), [strength.percentage]);

  if (!isOwner) return null;

  return (
    <div className={`rounded-lg shadow-lg p-6 border-2 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Profile Strength</h2>
        <span className={`text-2xl font-bold ${colors.text}`}>{strength.percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`absolute top-0 left-0 h-full ${colors.progress} transition-all duration-500 ease-out`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700 mb-4">{message}</p>

      {/* Missing Fields */}
      {strength.missingFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Complete your profile to reach {strength.nextMilestone}%:
          </h3>
          {strength.missingFields.slice(0, 3).map((field) => (
            <div
              key={field.field}
              className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">+{field.points}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{field.label}</p>
                <p className="text-xs text-gray-600">{field.tip}</p>
              </div>
              <svg
                className="flex-shrink-0 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Completion Badge */}
      {strength.percentage === 100 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-center">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-white font-bold text-lg">Profile Champion!</p>
          <p className="text-white text-sm opacity-90">
            You&apos;ve completed your profile. People are 10x more likely to connect with you!
          </p>
        </div>
      )}
    </div>
  );
}
