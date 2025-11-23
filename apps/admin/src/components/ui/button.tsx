import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default:
        'bg-poultryco-green text-white hover:bg-poultryco-green/90 focus-visible:ring-poultryco-green',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      outline:
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-500',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
      ghost: 'hover:bg-gray-100 text-gray-700',
      link: 'text-poultryco-green underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

