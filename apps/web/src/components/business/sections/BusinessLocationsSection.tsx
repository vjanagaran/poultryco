'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '../BusinessProfileView';
import { AddLocationModal } from '../modals/AddLocationModal';
import { EditLocationModal } from '../modals/EditLocationModal';

interface BusinessLocationsSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessLocationsSection({ business, isOwner }: BusinessLocationsSectionProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const sortedLocations = business.locations?.sort((a, b) => (a.is_primary ? -1 : 1)) || [];

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ➕ Add Location
            </button>
          )}
        </div>

        <div className="space-y-4">
          {sortedLocations.map((location) => (
            <div key={location.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {location.location_name && (
                      <h3 className="font-semibold text-gray-900">{location.location_name}</h3>
                    )}
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded capitalize">
                      {location.location_type.replace(/_/g, ' ')}
                    </span>
                    {location.is_primary && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Primary
                      </span>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setShowEditModal(true);
                        }}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                        title="Edit location"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {location.address_line1}
                    {location.address_line2 && `, ${location.address_line2}`}
                    <br />
                    {location.city && `${location.city}, `}
                    {location.state}
                    {location.postal_code && ` ${location.postal_code}`}
                  </p>
                  {location.phone && (
                    <p className="text-sm text-gray-600 mt-2">
                      📞 {location.phone}
                    </p>
                  )}
                  {location.operational_hours && (
                    <p className="text-xs text-gray-500 mt-1">
                      🕒 {location.operational_hours}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        businessId={business.id}
        onLocationAdded={() => router.refresh()}
      />

      {/* Edit Location Modal */}
      {selectedLocation && (
        <EditLocationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLocation(null);
          }}
          location={selectedLocation}
          businessId={business.id}
          onLocationUpdated={() => router.refresh()}
        />
      )}
    </>
  );
}

