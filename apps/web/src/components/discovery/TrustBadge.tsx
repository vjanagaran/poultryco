'use client';

export type TrustBadgeType = 
  | 'verified' 
  | 'premium' 
  | 'certified' 
  | 'trending' 
  | 'popular' 
  | 'top_seller'
  | 'featured';

interface TrustBadgeProps {
  type: TrustBadgeType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

interface BadgeConfig {
  icon: string;
  label: string;
  className: string;
}

const badgeConfigs: Record<TrustBadgeType, BadgeConfig> = {
  verified: {
    icon: '✓',
    label: 'Verified',
    className: 'bg-green-100 text-green-700',
  },
  premium: {
    icon: '⭐',
    label: 'Premium',
    className: 'bg-yellow-100 text-yellow-700',
  },
  certified: {
    icon: '🛡️',
    label: 'Certified',
    className: 'bg-blue-100 text-blue-700',
  },
  trending: {
    icon: '📈',
    label: 'Trending',
    className: 'bg-orange-100 text-orange-700',
  },
  popular: {
    icon: '👥',
    label: 'Popular',
    className: 'bg-purple-100 text-purple-700',
  },
  top_seller: {
    icon: '📦',
    label: 'Top Seller',
    className: 'bg-pink-100 text-pink-700',
  },
  featured: {
    icon: '⭐',
    label: 'Featured',
    className: 'bg-indigo-100 text-indigo-700',
  },
};

export function TrustBadge({ type, label, size = 'md', tooltip }: TrustBadgeProps) {
  const config = badgeConfigs[type];
  const displayLabel = label || config.label;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-xs gap-1',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };
  
  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${config.className} rounded-full font-medium`}
      title={tooltip}
    >
      <span>{config.icon}</span>
      <span>{displayLabel}</span>
    </span>
  );
}

