import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: boolean;
  children: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, icon = true, children, ...props }, ref) => {
    const baseStyles = "rounded-lg p-4 flex gap-3";
    
    const variants = {
      default: "bg-gray-50 text-gray-900 border border-gray-200",
      success: "bg-green-50 text-green-900 border border-green-200",
      warning: "bg-amber-50 text-amber-900 border border-amber-200",
      error: "bg-red-50 text-red-900 border border-red-200",
      info: "bg-blue-50 text-blue-900 border border-blue-200",
    };

    const icons = {
      default: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      info: "💡",
    };
    
    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        role="alert"
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0 text-xl" aria-hidden="true">
            {icons[variant]}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
