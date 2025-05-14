import React from 'react';
import { cn } from '../../utils/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'primary';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
        const mockColors: Record<NonNullable<BadgeProps['variant']>, string> = {
            default: 'border-transparent bg-blue-600 text-white dark:bg-blue-500', // 'default' often means primary
            primary: 'border-transparent bg-blue-600 text-white dark:bg-blue-500',
            secondary: 'border-transparent bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
            destructive: 'border-transparent bg-red-600 text-white dark:bg-red-500',
            outline: 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
        };
        const variantStyle = mockColors[variant] || mockColors.default;
        return (
            <div className={cn(baseStyle, variantStyle, className)} ref={ref} {...props}>
                {children}
            </div>
        );
    }
);
Badge.displayName = "Badge";
