'use client';

interface BasicInfoStepProps {
  data: any;
  onChange: (data: any) => void;
}

const BUSINESS_TYPES = [
  { value: 'farm', label: 'Farm' },
  { value: 'feed_mill', label: 'Feed Mill' },
  { value: 'hatchery', label: 'Hatchery' },
  { value: 'processing_plant', label: 'Processing Plant' },
  { value: 'medicine_company', label: 'Medicine Company' },
  { value: 'equipment_supplier', label: 'Equipment Supplier' },
  { value: 'chick_supplier', label: 'Chick Supplier' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'retail', label: 'Retail' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'integrator', label: 'Integrator' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.business_name}
          onChange={(e) => handleChange('business_name', e.target.value)}
          placeholder="e.g., Sunrise Poultry Farm"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Business Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile URL <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">poultryco.net/com/</span>
          <input
            type="text"
            value={data.business_slug}
            onChange={(e) => handleChange('business_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="sunrise-poultry-farm"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">This will be your business profile URL</p>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          value={data.business_type}
          onChange={(e) => handleChange('business_type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Select business type</option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline
        </label>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="e.g., Quality Broiler Production Since 1995"
          maxLength={150}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">{data.tagline.length}/150 characters</p>
      </div>

      {/* About */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About Your Business
        </label>
        <textarea
          value={data.about}
          onChange={(e) => handleChange('about', e.target.value)}
          placeholder="Tell people about your business, what you do, and what makes you unique..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{data.about.length}/500 characters</p>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Size
        </label>
        <select
          value={data.company_size}
          onChange={(e) => handleChange('company_size', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select company size</option>
          {COMPANY_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Founded Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Founded Year
        </label>
        <input
          type="number"
          value={data.founded_year}
          onChange={(e) => handleChange('founded_year', parseInt(e.target.value))}
          min="1900"
          max={new Date().getFullYear()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL
        </label>
        <input
          type="url"
          value={data.website_url}
          onChange={(e) => handleChange('website_url', e.target.value)}
          placeholder="https://www.yourwebsite.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

