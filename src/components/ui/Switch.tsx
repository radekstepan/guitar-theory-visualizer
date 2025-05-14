import React from 'react';
import { cn } from '../../utils/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, className, ...props }) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
    className={cn(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
      checked ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600',
      className
    )}
    role="switch"
    aria-checked={checked}
    {...props}
  />
);
