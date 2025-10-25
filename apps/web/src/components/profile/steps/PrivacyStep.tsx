'use client';

import { useState } from 'react';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  loading: boolean;
  isLast: boolean;
}

export default function PrivacyStep({ data, onNext, onBack, loading, isLast }: Props) {
  const [formData, setFormData] = useState({
    is_public: data.is_public ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
        <p className="text-gray-600">Control who can see your profile</p>
      </div>

      <div className="space-y-4">
        {/* Public Profile */}
        <div 
          onClick={() => setFormData({ is_public: true })}
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            formData.is_public
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              checked={formData.is_public}
              onChange={() => setFormData({ is_public: true })}
              className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌍</span>
                <h3 className="text-lg font-bold text-gray-900">Public Profile</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Recommended
                </span>
              </div>
              <p className="text-gray-600 mb-3">
                Your profile will be visible to all PoultryCo members and appear in search results.
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Appear in member directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Searchable by name, location, and role</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Receive connection requests from members</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Get discovered by potential clients/partners</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Private Profile */}
        <div 
          onClick={() => setFormData({ is_public: false })}
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            !formData.is_public
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              checked={!formData.is_public}
              onChange={() => setFormData({ is_public: false })}
              className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔒</span>
                <h3 className="text-lg font-bold text-gray-900">Private Profile</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Only your connections can see your full profile. You won't appear in public searches.
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Hidden from member directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Not searchable publicly</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Can still connect with specific members</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access all platform features</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Privacy Note</p>
            <p>You can change this setting anytime from your profile settings. Your contact information (email, phone) is always private and never shared publicly.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isLast ? 'Complete Profile ✓' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}

