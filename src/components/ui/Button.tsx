import React from 'react';
import { cn } from '../../utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    const mockTheme: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600',
      secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
      outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      destructive: 'bg-red-600 text-white dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600',
      link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline',
    };
    const variantStyle = mockTheme[variant] || mockTheme.default;
    return (
      <button className={cn(baseStyle, variantStyle, sizes[size], className)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
