import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'rose' | 'slate' | 'stone';
  className?: string;
}

export function Badge({ children, variant = 'amber', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
        {
          'bg-amber-100 text-amber-700': variant === 'amber',
          'bg-emerald-100 text-emerald-700': variant === 'emerald',
          'bg-rose-100 text-rose-700': variant === 'rose',
          'bg-slate-100 text-slate-700': variant === 'slate',
          'bg-stone-100 text-stone-600': variant === 'stone',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
