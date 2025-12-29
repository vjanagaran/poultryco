'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { BusinessProfile } from '../BusinessProfileView';
import { AssignContactPersonModal } from '../modals/AssignContactPersonModal';

interface BusinessContactSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessContactSection({ business, isOwner }: BusinessContactSectionProps) {
  const router = useRouter();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [removingContact, setRemovingContact] = useState<string | null>(null);

  const handleContactPerson = (profileId: string, contactType: string) => {
    router.push(`/messages?start_with=${profileId}&context=${contactType}_inquiry&business_id=${business.id}`);
  };

  const handleRemoveContact = async (contactId: string, contactName: string) => {
    if (!confirm(`Remove ${contactName} as contact person?`)) return;

    setRemovingContact(contactId);
    try {
      // TODO: Implement remove contact person endpoint
      await apiClient.delete(`/businesses/${business.id}/contact-persons/${contactId}`);
      router.refresh();
    } catch (error) {
      console.error('Error removing contact:', error);
      alert('Failed to remove contact person');
    } finally {
      setRemovingContact(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          {isOwner && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ➕ Assign Contact
            </button>
          )}
        </div>

        {/* Contact Persons */}
        {business.contact_persons && business.contact_persons.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Contact Persons</h3>
          {business.contact_persons
            .sort((a, b) => (a.is_primary ? -1 : 1))
            .map((contact) => (
              <div key={contact.id} className="border-b last:border-b-0 pb-4 last:pb-0 group">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {contact.profile.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{contact.profile.full_name}</h4>
                      {contact.is_primary && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Primary
                        </span>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveContact(contact.id, contact.profile.full_name)}
                          disabled={removingContact === contact.id}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-sm"
                          title="Remove contact"
                        >
                          {removingContact === contact.id ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {contact.contact_type.replace(/_/g, ' ')}
                    </p>
                    {contact.designation && (
                      <p className="text-xs text-gray-500">{contact.designation}</p>
                    )}
                    <button
                      onClick={() => handleContactPerson(contact.profile.id, contact.contact_type)}
                      className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      💬 Send Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Business Contact Info */}
      {business.contact && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Business Contact</h3>
          
          {business.contact.phone && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href={`tel:${business.contact.phone}`} className="text-gray-900 hover:text-green-600">
                  {business.contact.phone}
                </a>
              </div>
            </div>
          )}

          {business.contact.email && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${business.contact.email}`} className="text-gray-900 hover:text-green-600 break-all">
                  {business.contact.email}
                </a>
              </div>
            </div>
          )}

          {business.contact.whatsapp_business && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <div>
                <p className="text-sm text-gray-500">WhatsApp Business</p>
                <a href={`https://wa.me/${business.contact.whatsapp_business.replace(/[^0-9]/g, '')}`} className="text-gray-900 hover:text-green-600" target="_blank" rel="noopener noreferrer">
                  {business.contact.whatsapp_business}
                </a>
              </div>
            </div>
          )}

          {business.contact.headquarters_address && (
            <div className="flex items-start gap-3 mt-4">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Headquarters</p>
                <p className="text-gray-900">
                  {business.contact.headquarters_address}
                  <br />
                  {business.contact.headquarters_city && `${business.contact.headquarters_city}, `}
                  {business.contact.headquarters_state}
                  <br />
                  {business.contact.country}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

        {isOwner && (
          <button className="mt-6 w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            ✏️ Edit Contact Info
          </button>
        )}
      </div>

      {/* Assign Contact Person Modal */}
      <AssignContactPersonModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        businessId={business.id}
        teamMembers={business.team || []}
        onContactAssigned={() => router.refresh()}
      />
    </>
  );
}

