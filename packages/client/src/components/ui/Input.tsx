import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={clsx(
        'border rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        error ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
        className
      )}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Input.displayName = 'Input';
