import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import Link from 'next/link';

export interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  const iconElement = typeof icon === 'string' ? (
    <span className="text-4xl mb-4 block">{icon}</span>
  ) : (
    <div className="mb-4">{icon}</div>
  );

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-6",
      className
    )}>
      {iconElement}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="primary" size="sm">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export const EmptyStates = {
  NoResults: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="Try adjusting your search or filters"
      {...props}
    />
  ),
  NoContent: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📝"
      title="No content yet"
      description="Be the first to create something amazing"
      {...props}
    />
  ),
  NoMessages: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="💬"
      title="No messages"
      description="Start a conversation with your connections"
      {...props}
    />
  ),
  ComingSoon: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🚀"
      title="Coming Soon"
      description="We're working hard to bring you this feature"
      {...props}
    />
  ),
  Error: (props?: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="😕"
      title="Something went wrong"
      description="Please try again or contact support if the problem persists"
      {...props}
    />
  ),
};
