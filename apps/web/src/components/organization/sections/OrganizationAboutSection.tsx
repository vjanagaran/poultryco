'use client';

import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationAboutSectionProps {
  organization: OrganizationProfile;
  isOwner: boolean;
}

export function OrganizationAboutSection({ organization, isOwner }: OrganizationAboutSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">About</h2>
        {isOwner && (
          <button className="text-sm text-gray-500 hover:text-gray-700">
            ✏️ Edit
          </button>
        )}
      </div>

      {/* About */}
      {organization.about && (
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{organization.about}</p>
        </div>
      )}

      {/* Mission & Vision */}
      {(organization.mission || organization.vision) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {organization.mission && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">Mission</h3>
              <p className="text-gray-700 text-sm">{organization.mission}</p>
            </div>
          )}
          {organization.vision && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">Vision</h3>
              <p className="text-gray-700 text-sm">{organization.vision}</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Info */}
      {organization.contact && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Contact Information</h3>
          
          {organization.contact.headquarters_address && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Headquarters</p>
                <p className="text-gray-900">
                  {organization.contact.headquarters_address}
                  {organization.contact.headquarters_city && `, ${organization.contact.headquarters_city}`}
                  {organization.contact.headquarters_state && `, ${organization.contact.headquarters_state}`}
                </p>
              </div>
            </div>
          )}

          {organization.contact.phone && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a href={`tel:${organization.contact.phone}`} className="text-gray-900 hover:text-green-600">
                  {organization.contact.phone}
                </a>
              </div>
            </div>
          )}

          {organization.contact.email && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${organization.contact.email}`} className="text-gray-900 hover:text-green-600 break-all">
                  {organization.contact.email}
                </a>
              </div>
            </div>
          )}

          {organization.website_url && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a href={organization.website_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                  {organization.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

