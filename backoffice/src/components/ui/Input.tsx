import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon: Icon, error, rightElement, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 focus-within:z-10">
        {label && (
          <label className="block text-sm font-medium text-gray-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-primary">
              <Icon className={cn("h-5 w-5 text-gray-400", error && "text-red-400")} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "appearance-none block w-full border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all sm:text-sm py-3",
              Icon ? "pl-11" : "pl-4",
              rightElement ? "pr-11" : "pr-4",
              error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10" : "hover:border-gray-400",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
