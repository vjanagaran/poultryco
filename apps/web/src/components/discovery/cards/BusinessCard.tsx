'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BusinessResult } from '@/lib/api/discovery';
import { RatingDisplay } from '../RatingDisplay';
import { TrustBadge } from '../TrustBadge';

interface BusinessCardProps {
  business: BusinessResult;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const location = [business.location_city, business.location_state]
    .filter(Boolean)
    .join(', ');
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/com/${business.business_slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <Image
              src={business.logo_url || '/default-business.png'}
              alt={business.business_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/com/${business.business_slug}`}
            className="inline-flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {business.business_name}
            </h3>
            {business.is_verified && <TrustBadge type="verified" size="sm" />}
          </Link>
          
          {business.business_type?.name && (
            <p className="text-sm text-gray-500 mt-1">
              {business.business_type.name}
            </p>
          )}
          
          {business.tagline && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {business.tagline}
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
        {business.rating && business.rating > 0 && (
          <RatingDisplay 
            rating={business.rating} 
            reviewCount={business.review_count}
            size="sm"
          />
        )}
        
        {business.product_count !== undefined && business.product_count > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{business.product_count}</span>
            <span className="text-gray-500"> products</span>
          </div>
        )}
        
        {business.team_count !== undefined && business.team_count > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{business.team_count}</span>
            <span className="text-gray-500"> team</span>
          </div>
        )}
        
        {business.established_year && (
          <div className="text-sm text-gray-500">
            Est. {business.established_year}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Link 
          href={`/com/${business.business_slug}`}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
        >
          View Profile
        </Link>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Contact
        </button>
      </div>
    </article>
  );
}

