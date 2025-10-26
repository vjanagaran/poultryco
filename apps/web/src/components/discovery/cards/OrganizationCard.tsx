'use client';

import Link from 'next/link';
import Image from 'next/image';
import { OrganizationResult } from '@/lib/api/discovery';
import { TrustBadge } from '../TrustBadge';

interface OrganizationCardProps {
  organization: OrganizationResult;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const location = [organization.location_city, organization.location_state]
    .filter(Boolean)
    .join(', ');
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/org/${organization.slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <Image
              src={organization.logo_url || '/default-organization.png'}
              alt={organization.organization_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/org/${organization.slug}`}
            className="inline-flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {organization.organization_name}
            </h3>
            {organization.is_verified && <TrustBadge type="verified" size="sm" />}
          </Link>
          
          {organization.organization_type?.name && (
            <p className="text-sm text-gray-500 mt-1">
              {organization.organization_type.name}
            </p>
          )}
          
          {organization.tagline && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {organization.tagline}
            </p>
          )}
          
          {location && (
            <p className="text-sm text-gray-500 mt-2">
              📍 {location}
            </p>
          )}
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        {organization.member_count !== undefined && organization.member_count > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{organization.member_count.toLocaleString()}</span>
            <span className="text-gray-500"> members</span>
          </div>
        )}
        
        {organization.event_count !== undefined && organization.event_count > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{organization.event_count}</span>
            <span className="text-gray-500"> events</span>
          </div>
        )}
        
        {organization.resource_count !== undefined && organization.resource_count > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{organization.resource_count}</span>
            <span className="text-gray-500"> resources</span>
          </div>
        )}
        
        {organization.established_year && (
          <div className="text-sm text-gray-500">
            Est. {organization.established_year}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Link 
          href={`/org/${organization.slug}`}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
        >
          View Profile
        </Link>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Follow
        </button>
      </div>
    </article>
  );
}

