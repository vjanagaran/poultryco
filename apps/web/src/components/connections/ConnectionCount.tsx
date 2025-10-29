'use client';

// @ts-ignore - lucide-react type compatibility
import { Users } from 'lucide-react';
import { useConnectionStats } from '@/hooks/useConnectionStats';

interface ConnectionCountProps {
  profileId: string;
  variant?: 'full' | 'compact' | 'minimal';
  showFollowers?: boolean;
  className?: string;
}

export function ConnectionCount({ 
  profileId, 
  variant = 'full',
  showFollowers = true,
  className = ''
}: ConnectionCountProps) {
  const { data: stats, isLoading } = useConnectionStats(profileId);
  
  if (isLoading || !stats) return null;
  
  // Format count like LinkedIn (500+ for 500 or more)
  const formatCount = (count: number) => {
    if (count >= 500) return '500+';
    return count.toString();
  };
  
  // Minimal variant - just the connection count
  if (variant === 'minimal') {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        {formatCount(stats.connectionsCount)} connection{stats.connectionsCount !== 1 ? 's' : ''}
      </span>
    );
  }
  
  // Compact variant - connection count with icon
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 text-sm ${className}`}>
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-gray-900">{formatCount(stats.connectionsCount)}</span>
        <span className="text-muted-foreground">
          connection{stats.connectionsCount !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }
  
  // Full variant - LinkedIn style with followers
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <button className="font-semibold text-gray-900 hover:underline hover:text-blue-600">
        {formatCount(stats.connectionsCount)} connections
      </button>
      
      {showFollowers && stats.followersCount > 0 && (
        <>
          <span className="text-muted-foreground mx-1">•</span>
          <button className="font-semibold text-gray-900 hover:underline hover:text-blue-600">
            {stats.followersCount.toLocaleString()} follower{stats.followersCount !== 1 ? 's' : ''}
          </button>
        </>
      )}
    </div>
  );
}
