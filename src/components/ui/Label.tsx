import React from 'react';
import { cn } from '../../utils/utils';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ htmlFor, children, className, ...props }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>{children}</label>
);
