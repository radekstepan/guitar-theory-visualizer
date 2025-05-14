import React from 'react';
import { cn } from '../../utils/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
}
export const Select: React.FC<SelectProps> = ({ children, onValueChange, value, defaultValue, placeholder, ...props }) => {
  const effectiveValue = value ?? defaultValue ?? '';
  return (
    <select
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      value={effectiveValue}
      {...props}
    >
      {placeholder && !effectiveValue && <option value="" disabled hidden>{placeholder}</option>}
      {children}
    </select>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className, ...props }) => (
  <div className={cn("w-full", className)} {...props}>{children}</div> 
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => null; 

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children, ...props }) => <>{children}</>; 

export const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = ({ value, children, ...props }) => (
  <option value={value} {...props}>{children}</option>
);
