'use client';

import Image from 'next/image';

interface ReviewStepProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export function ReviewStep({ formData, onBack, onSubmit, loading }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before creating the organization</p>
      </div>

      {/* Photos Preview */}
      {(formData.logo_preview || formData.cover_preview) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Photos</h3>
          <div className="flex gap-4">
            {formData.logo_preview && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Logo</p>
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow">
                  <Image src={formData.logo_preview} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            {formData.cover_preview && (
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-2">Cover Photo</p>
                <div className="h-20 rounded-lg overflow-hidden border-2 border-white shadow">
                  <Image src={formData.cover_preview} alt="Cover" width={300} height={80} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Basic Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Organization Name:</span>
            <span className="font-medium text-gray-900">{formData.organization_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900 capitalize">{formData.organization_type.replace(/_/g, ' ')}</span>
          </div>
          {formData.founded_year && (
            <div className="flex justify-between">
              <span className="text-gray-600">Founded:</span>
              <span className="font-medium text-gray-900">{formData.founded_year}</span>
            </div>
          )}
          {formData.website_url && (
            <div className="flex justify-between">
              <span className="text-gray-600">Website:</span>
              <span className="font-medium text-gray-900 truncate max-w-xs">{formData.website_url}</span>
            </div>
          )}
        </div>
        {formData.about && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-600 mb-1">About:</p>
            <p className="text-sm text-gray-900">{formData.about}</p>
          </div>
        )}
        {(formData.mission || formData.vision) && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
            {formData.mission && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Mission:</p>
                <p className="text-xs text-gray-900">{formData.mission}</p>
              </div>
            )}
            {formData.vision && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Vision:</p>
                <p className="text-xs text-gray-900">{formData.vision}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Information */}
      {(formData.headquarters_address || formData.phone || formData.email) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm">
            {formData.headquarters_address && (
              <div>
                <span className="text-gray-600 block mb-1">Address:</span>
                <span className="text-gray-900">
                  {formData.headquarters_address}
                  {formData.headquarters_city && `, ${formData.headquarters_city}`}
                  {formData.headquarters_state && `, ${formData.headquarters_state}`}
                  {formData.country && `, ${formData.country}`}
                </span>
              </div>
            )}
            {formData.phone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{formData.phone}</span>
              </div>
            )}
            {formData.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{formData.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </div>
    </div>
  );
}

