'use client';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RatingDisplay({ 
  rating, 
  reviewCount, 
  size = 'md',
  showCount = true 
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const textClass = sizeClasses[size];
  
  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-yellow-400">⭐</span>
      <span className={`${textClass} font-semibold text-gray-900`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={`${textClass} text-gray-500`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

