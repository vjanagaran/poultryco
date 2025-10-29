'use client';

import Link from 'next/link';
import Image from 'next/image';
// @ts-ignore - lucide-react type compatibility
import { Users } from 'lucide-react';
import { useMutualConnections } from '@/hooks/useConnectionStats';

interface MutualConnectionsProps {
  currentUserId?: string;
  targetUserId: string;
  variant?: 'full' | 'compact';
  className?: string;
}

export function MutualConnections({
  currentUserId,
  targetUserId,
  variant = 'compact',
  className = ''
}: MutualConnectionsProps) {
  const { data, isLoading } = useMutualConnections(currentUserId, targetUserId);
  
  if (isLoading || !data || data.count === 0 || !currentUserId) {
    return null;
  }
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Users className="h-4 w-4" />
        <span>{data.count} mutual connection{data.count !== 1 ? 's' : ''}</span>
      </div>
    );
  }
  
  // Full variant with profile previews and names - LinkedIn style
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        {data.profiles.length > 0 && (
          <div className="flex -space-x-1">
            {data.profiles.slice(0, 2).map((profile) => (
              <Link
                key={profile.id}
                href={`/me/${profile.username}`}
                className="relative inline-block"
              >
                <div className="h-6 w-6 rounded-full overflow-hidden border-2 border-white hover:z-10 transition-transform">
                  {profile.profile_photo_url ? (
                    <Image
                      src={profile.profile_photo_url}
                      alt={profile.full_name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-medium">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          {data.profiles.length > 0 && (
            <>
              <Link href={`/me/${data.profiles[0].username}`} className="font-semibold hover:underline hover:text-blue-600">
                {data.profiles[0].full_name}
              </Link>
              {data.profiles.length > 1 && (
                <>
                  <span>, </span>
                  <Link href={`/me/${data.profiles[1].username}`} className="font-semibold hover:underline hover:text-blue-600">
                    {data.profiles[1].full_name}
                  </Link>
                </>
              )}
              {data.count > 2 && (
                <span>, and {data.count - 2} other{data.count - 2 !== 1 ? 's' : ''}</span>
              )}
              <span> {data.count === 1 ? 'is a' : 'are'} mutual connection{data.count !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
