'use client';

import { BusinessProfile } from '../BusinessProfileView';

interface BusinessAboutSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessAboutSection({ business, isOwner }: BusinessAboutSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">About</h2>
        {isOwner && (
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            ✏️ Edit
          </button>
        )}
      </div>

      {business.about ? (
        <p className="text-gray-700 whitespace-pre-wrap">{business.about}</p>
      ) : (
        <p className="text-gray-400 italic">No description added yet.</p>
      )}

      {/* Business Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Business Type</h3>
          <p className="text-gray-900 capitalize">{business.business_type.replace(/_/g, ' ')}</p>
        </div>

        {business.industry_category && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Industry Category</h3>
            <p className="text-gray-900">{business.industry_category}</p>
          </div>
        )}

        {business.company_size && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Company Size</h3>
            <p className="text-gray-900">{business.company_size} employees</p>
          </div>
        )}

        {business.founded_year && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Founded</h3>
            <p className="text-gray-900">{business.founded_year}</p>
          </div>
        )}

        {/* Farm-Specific Details */}
        {business.farm_details && (
          <>
            {business.farm_details.farm_type.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Farm Type</h3>
                <p className="text-gray-900 capitalize">
                  {business.farm_details.farm_type.join(', ')}
                </p>
              </div>
            )}
            {business.farm_details.total_capacity && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Capacity</h3>
                <p className="text-gray-900">
                  {business.farm_details.total_capacity.toLocaleString()} birds
                </p>
              </div>
            )}
            {business.farm_details.farming_system && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Farming System</h3>
                <p className="text-gray-900 capitalize">
                  {business.farm_details.farming_system.replace(/_/g, ' ')}
                </p>
              </div>
            )}
            {business.farm_details.organic_certified && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Certifications</h3>
                <p className="text-gray-900">✅ Organic Certified</p>
              </div>
            )}
          </>
        )}

        {/* Supplier-Specific Details */}
        {business.supplier_details && (
          <>
            {business.supplier_details.supply_categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Supply Categories</h3>
                <p className="text-gray-900 capitalize">
                  {business.supplier_details.supply_categories.join(', ')}
                </p>
              </div>
            )}
            {business.supplier_details.home_delivery_available && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Services</h3>
                <p className="text-gray-900">✅ Home Delivery Available</p>
              </div>
            )}
            {business.supplier_details.technical_support_available && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Support</h3>
                <p className="text-gray-900">✅ Technical Support Available</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

