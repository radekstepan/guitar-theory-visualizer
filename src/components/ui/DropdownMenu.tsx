import React from 'react';
import { cn } from '../../utils/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
}
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => (
  <div className="relative inline-block text-left">{children}</div>
);

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean; 
}
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild }) => {
  return <>{children}</>;
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end'; 
}
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className, align = 'end' }) => {
  const alignClass = align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 transform -translate-x-1/2';
  return (
    <div className={cn(
      "absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none",
      alignClass,
      className
    )}>
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {children}
      </div>
    </div>
  );
};

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  inset?: boolean; 
}
export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ children, className, inset, ...props }, ref) => (
    <button
      className={cn(
        "block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left",
        inset && "pl-8",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="menuitem"
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}
export const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({ children, checked, onCheckedChange, className, disabled }) => (
  <button
    className={cn(
      "w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
    role="menuitemcheckbox"
    aria-checked={checked}
    onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
    disabled={disabled}
  >
    <span>{children}</span>
    {checked && <span className="text-blue-600 dark:text-blue-400">✓</span>} {/* Checkmark */}
  </button>
);

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("h-px bg-gray-200 dark:bg-gray-700 my-1", className)} />
);

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode, className?: string, inset?: boolean }> = ({ children, className, inset }) => (
    <div className={cn("px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400", inset && "pl-8", className)}>
        {children}
    </div>
);

// --- Mock DropdownMenuRadioGroup & DropdownMenuRadioItem ---
interface DropdownMenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
export const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({ value, onValueChange, children, className }) => {
  // In a real component, this would provide context to RadioItems.
  // For the mock, we'll pass down props directly or rely on AppHeader to manage state.
  // Children will be mapped to pass down necessary props if needed.
  return (
    <div role="radiogroup" className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && typeof child.type !== 'string' && (child.type as any).displayName === 'DropdownMenuRadioItem') {
          // Clone child to pass down value and onValueChange if they need to interact with a context
          // For this simple mock, the RadioItem will handle its own checked state based on its value prop
          // and the group's value prop. The onValueChange is handled at the group level.
          return React.cloneElement(child as React.ReactElement<DropdownMenuRadioItemProps>, {
            currentGroupValue: value, // Pass the group's current value
            onSelect: () => onValueChange && child.props.value && onValueChange(child.props.value), // Item triggers group's change
          });
        }
        return child;
      })}
    </div>
  );
};

interface DropdownMenuRadioItemProps {
  children: React.ReactNode;
  value: string; // Each radio item must have a unique value
  className?: string;
  disabled?: boolean;
  // Props injected by DropdownMenuRadioGroup mock
  currentGroupValue?: string;
  onSelect?: () => void;
}
export const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  ({ children, value, className, disabled, currentGroupValue, onSelect, ...props }, ref) => {
    const isSelected = value === currentGroupValue;
    return (
      <button
        className={cn(
          "block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        role="menuitemradio"
        aria-checked={isSelected}
        onClick={() => !disabled && onSelect && onSelect()}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <span className="w-4 h-4 mr-2 flex items-center justify-center">
          {/* Simple dot for selected state, like a radio button */}
          {isSelected && <span className="block w-2 h-2 bg-blue-500 rounded-full"></span>}
        </span>
        {children}
      </button>
    );
  }
);
(DropdownMenuRadioItem as any).displayName = 'DropdownMenuRadioItem'; // For type checking in RadioGroup
