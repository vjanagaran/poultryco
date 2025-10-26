'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationHeaderProps {
  organization: OrganizationProfile;
  isOwner: boolean;
}

export function OrganizationHeader({ organization, isOwner }: OrganizationHeaderProps) {
  return (
    <div className="bg-white border-b">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-green-400 to-blue-500">
        {organization.cover_photo_url && (
          <Image
            src={organization.cover_photo_url}
            alt={`${organization.organization_name} cover`}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          {/* Logo */}
          <div className="absolute -top-16 left-0">
            <div className="w-32 h-32 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-white">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt={organization.organization_name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {organization.organization_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info & Actions */}
          <div className="pt-20 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {organization.display_name || organization.organization_name}
                </h1>
                {organization.is_verified && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2 capitalize">
                {organization.organization_type.replace(/_/g, ' ')}
              </p>
              {organization.contact && (
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {organization.contact.headquarters_city && organization.contact.headquarters_state && (
                    <span>📍 {organization.contact.headquarters_city}, {organization.contact.headquarters_state}</span>
                  )}
                  {organization.founded_year && (
                    <span>📅 Est. {organization.founded_year}</span>
                  )}
                  {organization.member_count && (
                    <span>👥 {organization.member_count} Members</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isOwner && (
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                  Join Organization
                </button>
              )}
              {isOwner && (
                <Link
                  href={`/org/${organization.organization_slug}/edit`}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  ✏️ Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

