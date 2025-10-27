import React from 'react';
import { cn } from '@/lib/utils';

// Form Wrapper Component
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";

// Form Section Component for grouping related fields
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children, className, ...props }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// Form Row Component for horizontal layouts
export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormRow({ children, className, ...props }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)} {...props}>
      {children}
    </div>
  );
}

// Form Actions Component for buttons
export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function FormActions({ children, align = 'right', className, ...props }: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn(
      "flex items-center gap-4 pt-6 border-t border-gray-200",
      alignClasses[align],
      className
    )} {...props}>
      {children}
    </div>
  );
}

// Form Error Component
export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | null;
}

export function FormError({ error, className, ...props }: FormErrorProps) {
  if (!error) return null;
  
  return (
    <div className={cn(
      "bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm",
      className
    )} {...props}>
      {error}
    </div>
  );
}

// Form Success Component
export interface FormSuccessProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string | null;
}

export function FormSuccess({ message, className, ...props }: FormSuccessProps) {
  if (!message) return null;
  
  return (
    <div className={cn(
      "bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm",
      className
    )} {...props}>
      {message}
    </div>
  );
}

// Select Component to match Input/Textarea styling
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <select
          className={cn(
            "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
