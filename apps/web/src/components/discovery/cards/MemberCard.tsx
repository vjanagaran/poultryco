'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MemberResult } from '@/lib/api/discovery';
import { RatingDisplay } from '../RatingDisplay';
import { TrustBadge } from '../TrustBadge';

interface MemberCardProps {
  member: MemberResult;
}

export function MemberCard({ member }: MemberCardProps) {
  const location = [member.location_city, member.location_state]
    .filter(Boolean)
    .join(', ');
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/me/${member.profile_slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <Image
              src={member.profile_photo_url || '/default-avatar.png'}
              alt={member.full_name}
              fill
              className="rounded-full object-cover"
            />
          </div>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/me/${member.profile_slug}`}
            className="inline-flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {member.full_name}
            </h3>
            {member.is_verified && <TrustBadge type="verified" size="sm" />}
          </Link>
          
          {member.headline && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {member.headline}
            </p>
          )}
          
          {member.current_role && (
            <p className="text-sm text-gray-500 mt-1">
              {member.current_role}
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
        <div className="text-sm text-gray-600">
          <span className="font-medium">{member.connections_count || 0}</span>
          <span className="text-gray-500"> connections</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <span className="font-medium">{member.followers_count || 0}</span>
          <span className="text-gray-500"> followers</span>
        </div>
        
        {member.rating && member.rating > 0 && (
          <RatingDisplay 
            rating={member.rating} 
            reviewCount={member.review_count}
            size="sm"
          />
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          Connect
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Message
        </button>
      </div>
    </article>
  );
}

