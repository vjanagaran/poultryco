'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '../BusinessProfileView';
import { AddCertificationModal } from '../modals/AddCertificationModal';
import { EditCertificationModal } from '../modals/EditCertificationModal';

interface BusinessCertificationsSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessCertificationsSection({ business, isOwner }: BusinessCertificationsSectionProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Certifications & Accreditations</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ➕ Add Certification
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {business.certifications?.map((cert) => (
            <div
              key={cert.id}
              className={`p-4 border rounded-lg ${
                isExpired(cert.expiry_date)
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors group`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 mb-1 flex-1">{cert.certification_name}</h3>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setSelectedCertification(cert);
                          setShowEditModal(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                        title="Edit certification"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cert.issuing_authority}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {cert.issue_date && <span>Issued: {formatDate(cert.issue_date)}</span>}
                    {cert.expiry_date && (
                      <span className={isExpired(cert.expiry_date) ? 'text-red-600 font-medium' : ''}>
                        {isExpired(cert.expiry_date) ? '❌ Expired: ' : 'Valid until: '}
                        {formatDate(cert.expiry_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {cert.certification_type && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded capitalize">
                        {cert.certification_type.replace(/_/g, ' ')}
                      </span>
                    )}
                    {cert.certificate_file_url && (
                      <a
                        href={cert.certificate_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        📄 View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Certification Modal */}
      <AddCertificationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        businessId={business.id}
        onCertificationAdded={() => router.refresh()}
      />

      {/* Edit Certification Modal */}
      {selectedCertification && (
        <EditCertificationModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCertification(null);
          }}
          certification={selectedCertification}
          businessId={business.id}
          onCertificationUpdated={() => router.refresh()}
        />
      )}
    </>
  );
}

