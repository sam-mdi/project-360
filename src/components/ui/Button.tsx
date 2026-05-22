import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-amber-500 hover:bg-amber-400 text-white shadow-sm': variant === 'primary',
          'bg-stone-200 hover:bg-stone-300 text-stone-800': variant === 'secondary',
          'hover:bg-stone-100 text-stone-600': variant === 'ghost',
          'bg-rose-500 hover:bg-rose-600 text-white': variant === 'danger',
          'border border-stone-300 hover:bg-stone-50 text-stone-700': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
