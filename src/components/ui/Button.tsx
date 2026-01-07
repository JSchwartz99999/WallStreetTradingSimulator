import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base font-semibold',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'success' && 'focus:ring-emerald-400',
        variant === 'danger' && 'focus:ring-red-400',
        variant === 'primary' && 'focus:ring-emerald-400',
        variant === 'secondary' && 'focus:ring-gray-400',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
