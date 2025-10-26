'use client';

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  isFirstStep: boolean;
}

const ORGANIZATION_TYPES = [
  { value: 'association', label: 'Industry Association' },
  { value: 'cooperative', label: 'Cooperative Society' },
  { value: 'chamber', label: 'Chamber of Commerce' },
  { value: 'federation', label: 'Federation' },
  { value: 'council', label: 'Industry Council' },
  { value: 'forum', label: 'Professional Forum' },
  { value: 'ngo', label: 'NGO/Non-Profit' },
  { value: 'government', label: 'Government Body' },
  { value: 'research', label: 'Research Institute' },
  { value: 'other', label: 'Other' },
];

export function BasicInfoStep({ formData, setFormData, onNext }: BasicInfoStepProps) {
  const canProceed = formData.organization_name && formData.organization_type;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us about your organization</p>
      </div>

      {/* Organization Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.organization_name}
          onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Indian Poultry Association"
          required
        />
      </div>

      {/* Organization Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.organization_type}
          onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Select type</option>
          {ORGANIZATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* About */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About
        </label>
        <textarea
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          placeholder="Brief description of your organization..."
        />
        <p className="text-xs text-gray-500 mt-1">{formData.about.length}/1000 characters</p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mission
          </label>
          <textarea
            value={formData.mission}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Our mission..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vision
          </label>
          <textarea
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Our vision..."
          />
        </div>
      </div>

      {/* Founded Year & Website */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Founded Year
          </label>
          <input
            type="number"
            value={formData.founded_year}
            onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 1990"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

