'use client';

import { useState } from 'react';

interface Props {
  selectedRoles: string[];
  roleDetails: Record<string, any>;
  onRoleDetailsChange: (details: Record<string, any>) => void;
  onNext: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

export default function RoleDetailsStep({ selectedRoles, roleDetails, onRoleDetailsChange, onNext, onBack, loading }: Props) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const currentRole = selectedRoles[currentRoleIndex];

  const handleDetailChange = (field: string, value: any) => {
    onRoleDetailsChange({
      ...roleDetails,
      [currentRole]: {
        ...roleDetails[currentRole],
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (currentRoleIndex < selectedRoles.length - 1) {
      setCurrentRoleIndex(currentRoleIndex + 1);
    } else {
      onNext({});
    }
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us more about your role</h2>
        <p className="text-gray-600">
          Role {currentRoleIndex + 1} of {selectedRoles.length}: <strong className="capitalize">{currentRole?.replace('_', ' ')}</strong>
        </p>
      </div>

      {/* Farmer Details */}
      {currentRole === 'farmer' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              value={roleDetails.farmer?.years_of_experience || ''}
              onChange={(e) => handleDetailChange('years_of_experience', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Specialization (select all that apply)
            </label>
            <div className="space-y-2">
              {['Broiler', 'Layer', 'Breeder', 'Hatchery', 'Backyard', 'Organic'].map(spec => (
                <label key={spec} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roleDetails.farmer?.farm_specialization?.includes(spec.toLowerCase()) || false}
                    onChange={(e) => {
                      const current = roleDetails.farmer?.farm_specialization || [];
                      const updated = e.target.checked
                        ? [...current, spec.toLowerCase()]
                        : current.filter((s: string) => s !== spec.toLowerCase());
                      handleDetailChange('farm_specialization', updated);
                    }}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Scale
            </label>
            <select
              value={roleDetails.farmer?.farm_scale || ''}
              onChange={(e) => handleDetailChange('farm_scale', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select scale</option>
              <option value="small">Small (Less than 5,000 birds)</option>
              <option value="medium">Medium (5,000 - 20,000 birds)</option>
              <option value="large">Large (20,000 - 100,000 birds)</option>
              <option value="commercial">Commercial (100,000+ birds)</option>
            </select>
          </div>
        </div>
      )}

      {/* Veterinarian Details */}
      {currentRole === 'veterinarian' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            <input
              type="text"
              value={roleDetails.veterinarian?.license_number || ''}
              onChange={(e) => handleDetailChange('license_number', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="BVSc License Number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Practice
            </label>
            <input
              type="number"
              min="0"
              value={roleDetails.veterinarian?.years_of_practice || ''}
              onChange={(e) => handleDetailChange('years_of_practice', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Poultry Medicine', 'Nutrition', 'Pathology', 'Surgery', 'Disease Management', 'Biosecurity'].map(spec => (
                <label key={spec} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roleDetails.veterinarian?.specialization?.includes(spec.toLowerCase().replace(' ', '_')) || false}
                    onChange={(e) => {
                      const current = roleDetails.veterinarian?.specialization || [];
                      const value = spec.toLowerCase().replace(' ', '_');
                      const updated = e.target.checked
                        ? [...current, value]
                        : current.filter((s: string) => s !== value);
                      handleDetailChange('specialization', updated);
                    }}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={roleDetails.veterinarian?.emergency_available || false}
                onChange={(e) => handleDetailChange('emergency_available', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Available for emergency consultations</span>
            </label>
          </div>
        </div>
      )}

      {/* Supplier Details */}
      {currentRole === 'supplier' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you supply? (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Feed', 'Medicine', 'Equipment', 'Chicks', 'Vaccines', 'Supplements'].map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roleDetails.supplier?.supplier_type?.includes(type.toLowerCase()) || false}
                    onChange={(e) => {
                      const current = roleDetails.supplier?.supplier_type || [];
                      const updated = e.target.checked
                        ? [...current, type.toLowerCase()]
                        : current.filter((s: string) => s !== type.toLowerCase());
                      handleDetailChange('supplier_type', updated);
                    }}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years in Business
            </label>
            <input
              type="number"
              min="0"
              value={roleDetails.supplier?.years_in_business || ''}
              onChange={(e) => handleDetailChange('years_in_business', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={roleDetails.supplier?.delivery_available || false}
                onChange={(e) => handleDetailChange('delivery_available', e.target.checked)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Delivery available</span>
            </label>
          </div>
        </div>
      )}

      {/* Generic fallback for other roles */}
      {!['farmer', 'veterinarian', 'supplier'].includes(currentRole) && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-gray-700">
            Detailed fields for <strong className="capitalize">{currentRole?.replace('_', ' ')}</strong> are coming soon.
            <br />
            You can skip this step for now and add details later.
          </p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={currentRoleIndex > 0 ? () => setCurrentRoleIndex(currentRoleIndex - 1) : onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentRoleIndex < selectedRoles.length - 1 ? 'Next Role →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

