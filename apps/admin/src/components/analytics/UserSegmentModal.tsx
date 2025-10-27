'use client';

import { ProfileCompletionSegment } from '@/lib/api/analytics';
import Link from 'next/link';

interface UserSegmentModalProps {
  segment: ProfileCompletionSegment | null;
  onClose: () => void;
}

export function UserSegmentModal({ segment, onClose }: UserSegmentModalProps) {
  if (!segment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Users in {segment.range} Completion Range
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {segment.count} users ({segment.percentage.toFixed(1)}% of total)
          </p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {segment.users && segment.users.length > 0 ? (
            <div className="space-y-4">
              {segment.users.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {user.profile_strength}%
                      </div>
                      <Link
                        href={`/users/${user.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {segment.count > 10 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing top 10 users. {segment.count - 10} more users in this segment.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No users in this segment</p>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>Action Items:</strong>
              <ul className="mt-1 space-y-1">
                {segment.range === '0-20%' && (
                  <>
                    <li>• Send onboarding reminder emails</li>
                    <li>• Offer profile completion incentives</li>
                  </>
                )}
                {segment.range === '20-50%' && (
                  <>
                    <li>• Send tips for completing profile</li>
                    <li>• Highlight missing sections</li>
                  </>
                )}
                {segment.range === '50-80%' && (
                  <>
                    <li>• Encourage adding professional details</li>
                    <li>• Suggest connecting with others</li>
                  </>
                )}
                {segment.range === '80%+' && (
                  <>
                    <li>• Reward with badges or features</li>
                    <li>• Invite to beta programs</li>
                  </>
                )}
              </ul>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
