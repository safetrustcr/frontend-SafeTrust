import { type ComponentProps, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface SelectProps extends ComponentProps<'select'> {
  variant?: 'default' | 'underlined';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full p-2 transition-colors text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600',
          {
            'border rounded-md focus:ring-2 focus:ring-default-color focus:border-default-color':
              variant === 'default',
            'border-b border-t-0 border-x-0 border-gray-400 focus:ring-0 focus:border-default-color bg-transparent dark:bg-gray-700':
              variant === 'underlined',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';
