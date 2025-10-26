'use client';

interface TypeSpecificStepProps {
  data: any;
  onChange: (data: any) => void;
}

const FARM_TYPES = [
  { value: 'broiler', label: 'Broiler' },
  { value: 'layer', label: 'Layer' },
  { value: 'breeder', label: 'Breeder' },
  { value: 'hatchery', label: 'Hatchery' },
  { value: 'integrated', label: 'Integrated' },
  { value: 'organic', label: 'Organic' },
  { value: 'free_range', label: 'Free Range' },
];

const FARMING_SYSTEMS = [
  { value: 'conventional', label: 'Conventional' },
  { value: 'organic', label: 'Organic' },
  { value: 'free_range', label: 'Free Range' },
  { value: 'cage_free', label: 'Cage Free' },
  { value: 'deep_litter', label: 'Deep Litter' },
  { value: 'battery_cage', label: 'Battery Cage' },
  { value: 'semi_intensive', label: 'Semi Intensive' },
];

const SUPPLY_CATEGORIES = [
  { value: 'feed', label: 'Feed' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'chicks', label: 'Chicks' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'disinfectants', label: 'Disinfectants' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'spare_parts', label: 'Spare Parts' },
  { value: 'lab_supplies', label: 'Lab Supplies' },
  { value: 'other', label: 'Other' },
];

export default function TypeSpecificStep({ data, onChange }: TypeSpecificStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      typeSpecificData: {
        ...data.typeSpecificData,
        [field]: value,
      },
    });
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = data.typeSpecificData[field] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    handleChange(field, newValues);
  };

  // Render farm-specific fields
  if (data.business_type === 'farm') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Details</h2>
          <p className="text-gray-600">Tell us about your farm operations</p>
        </div>

        {/* Farm Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Farm Type (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FARM_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.typeSpecificData.farm_type || []).includes(type.value)}
                  onChange={(e) => handleCheckboxChange('farm_type', type.value, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Total Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Capacity (Number of Birds)
          </label>
          <input
            type="number"
            value={data.typeSpecificData.total_capacity || ''}
            onChange={(e) => handleChange('total_capacity', parseInt(e.target.value) || null)}
            placeholder="e.g., 10000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Number of Sheds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Sheds
          </label>
          <input
            type="number"
            value={data.typeSpecificData.number_of_sheds || ''}
            onChange={(e) => handleChange('number_of_sheds', parseInt(e.target.value) || null)}
            placeholder="e.g., 4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Farming System */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farming System
          </label>
          <select
            value={data.typeSpecificData.farming_system || ''}
            onChange={(e) => handleChange('farming_system', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select farming system</option>
            {FARMING_SYSTEMS.map((system) => (
              <option key={system.value} value={system.value}>
                {system.label}
              </option>
            ))}
          </select>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Certifications</label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.organic_certified || false}
              onChange={(e) => handleChange('organic_certified', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Organic Certified</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.halal_certified || false}
              onChange={(e) => handleChange('halal_certified', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Halal Certified</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.animal_welfare_certified || false}
              onChange={(e) => handleChange('animal_welfare_certified', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Animal Welfare Certified</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.fssai_certified || false}
              onChange={(e) => handleChange('fssai_certified', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">FSSAI Certified</span>
          </label>
        </div>
      </div>
    );
  }

  // Render supplier-specific fields
  if (['medicine_company', 'equipment_supplier', 'chick_supplier', 'distributor', 'feed_mill'].includes(data.business_type)) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Supplier Details</h2>
          <p className="text-gray-600">Tell us about your products and services</p>
        </div>

        {/* Supply Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Supply Categories (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SUPPLY_CATEGORIES.map((category) => (
              <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.typeSpecificData.supply_categories || []).includes(category.value)}
                  onChange={(e) => handleCheckboxChange('supply_categories', category.value, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Services Offered</label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.home_delivery_available || false}
              onChange={(e) => handleChange('home_delivery_available', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Home Delivery Available</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.technical_support_available || false}
              onChange={(e) => handleChange('technical_support_available', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Technical Support Available</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.after_sales_service || false}
              onChange={(e) => handleChange('after_sales_service', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">After Sales Service</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.typeSpecificData.bulk_discount_available || false}
              onChange={(e) => handleChange('bulk_discount_available', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Bulk Discount Available</span>
          </label>
        </div>

        {/* Delivery Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typical Delivery Time (Days)
          </label>
          <input
            type="number"
            value={data.typeSpecificData.delivery_time_days || ''}
            onChange={(e) => handleChange('delivery_time_days', parseInt(e.target.value) || null)}
            placeholder="e.g., 3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Credit Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Period (Days)
          </label>
          <input
            type="number"
            value={data.typeSpecificData.credit_period_days || ''}
            onChange={(e) => handleChange('credit_period_days', parseInt(e.target.value) || null)}
            placeholder="e.g., 30"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    );
  }

  // Default for other business types
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
        <p className="text-gray-600">Additional information about your business</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <span className="text-4xl mb-4 block">✓</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Set!</h3>
        <p className="text-gray-600">
          You can add more details and manage your business profile after creation.
        </p>
      </div>
    </div>
  );
}

