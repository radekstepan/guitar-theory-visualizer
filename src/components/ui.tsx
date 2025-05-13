import React from 'react';

export const cn = (...inputs: (string | undefined | null | false)[]): string => {
  return inputs.filter(Boolean).join(' ');
}

// --- Mock Card ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm dark:bg-gray-800 dark:border-gray-700", className)} {...props}>{children}</div>
);
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>
);
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-gray-800 dark:text-gray-200", className)} {...props}>{children}</h3>
);
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>
);

// --- Mock Select ---
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
  <div className={cn("w-full", className)} {...props}>{children}</div> // This is a simplification. Real SelectTrigger is a button.
);
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => null; // Placeholder for structure, value is handled by <select>
export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children, ...props }) => <>{children}</>; // SelectContent usually implies a dropdown popover
export const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = ({ value, children, ...props }) => (
  <option value={value} {...props}>{children}</option>
);

// --- Mock Label ---
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ htmlFor, children, className, ...props }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>{children}</label>
);

// --- Mock Switch ---
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
  >
    {/* Visual part of the switch usually handled by ::before/::after or spans in shadcn */}
  </input>
);
// Note: The original mock had an inner span for the thumb. An input[type=checkbox] can be styled directly or with pseudo-elements,
// but for a simple mock, this structure is common. A more faithful mock might use a button and manage state.

// --- Mock Button ---
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

// --- Mock Badge ---
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
