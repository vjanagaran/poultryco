'use client';

import Link from 'next/link';
import Image from 'next/image';
import { EventResult } from '@/lib/api/discovery';
import { TrustBadge } from '../TrustBadge';

interface EventCardProps {
  event: EventResult;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const isPastEvent = new Date(event.start_datetime) < new Date();
  
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      {/* Event Cover Image */}
      <Link href={`/org/${event.organizer.slug}`} className="block relative h-40 bg-gray-100">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
            📅
          </div>
        )}
        {event.is_featured && (
          <div className="absolute top-2 right-2">
            <TrustBadge type="verified" label="Featured" size="sm" />
          </div>
        )}
      </Link>
      
      <div className="p-4">
        {/* Date Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center min-w-[60px]">
            <div className="text-2xl font-bold text-green-600">
              {new Date(event.start_datetime).getDate()}
            </div>
            <div className="text-xs text-green-700 uppercase">
              {new Date(event.start_datetime).toLocaleDateString('en-IN', { month: 'short' })}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {formatDate(event.start_datetime)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(event.start_datetime)}
            </div>
          </div>
        </div>
        
        {/* Event Info */}
        <Link 
          href={`/org/${event.organizer.slug}`}
          className="hover:text-green-600 transition-colors"
        >
          <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-2">
            {event.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>{event.event_type?.name || 'Event'}</span>
          {event.format && (
            <>
              <span>•</span>
              <span className="capitalize">{event.format}</span>
            </>
          )}
        </div>
        
        {/* Location */}
        {event.format === 'in_person' && event.location_city && (
          <p className="text-sm text-gray-600 mb-2">
            📍 {event.location_city}{event.location_state ? `, ${event.location_state}` : ''}
          </p>
        )}
        
        {/* Organizer */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="relative w-6 h-6">
            <Image
              src={event.organizer.logo_url || '/default-organization.png'}
              alt={event.organizer.organization_name}
              fill
              className="rounded object-cover"
            />
          </div>
          <Link 
            href={`/org/${event.organizer.slug}`}
            className="text-sm text-gray-600 hover:text-green-600 truncate"
          >
            {event.organizer.organization_name}
          </Link>
        </div>
        
        {/* Trust Indicators */}
        <div className="flex items-center gap-4 mb-3">
          {event.registered_count !== undefined && event.registered_count > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{event.registered_count}</span>
              <span className="text-gray-500"> attending</span>
            </div>
          )}
          
          {event.capacity && (
            <div className="text-xs text-gray-500">
              Capacity: {event.capacity}
            </div>
          )}
        </div>
        
        {/* Actions */}
        {!isPastEvent ? (
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            {event.is_free ? 'Register Free' : 'View Details'}
          </button>
        ) : (
          <button className="w-full px-4 py-2 border border-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium">
            Event Ended
          </button>
        )}
      </div>
    </article>
  );
}

