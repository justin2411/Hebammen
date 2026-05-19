import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

const INPUT_BASE =
  'w-full rounded-md border border-rule bg-white px-3 py-2 text-base text-ink tabular-nums ' +
  'transition-colors placeholder:text-muted/70 focus:border-berry focus:outline-none ' +
  'focus:ring-2 focus:ring-berry/15 disabled:bg-cream-dark disabled:text-muted';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={cn(INPUT_BASE, className)} {...rest} />
  ),
);
TextInput.displayName = 'TextInput';

export const NumberInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      type="number"
      inputMode="decimal"
      className={cn(INPUT_BASE, className)}
      {...rest}
    />
  ),
);
NumberInput.displayName = 'NumberInput';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select ref={ref} className={cn(INPUT_BASE, 'pr-8', className)} {...rest}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-md border border-rule bg-white p-3 text-left transition-colors hover:border-berry/30"
    >
      <span
        className={cn(
          'mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-berry' : 'bg-rule',
        )}
      >
        <span
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className="flex-1">
        {label && <span className="block text-sm font-medium text-ink">{label}</span>}
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </button>
  );
}

interface RangeProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (n: number) => string;
  label: string;
}

export function Range({ value, onChange, min, max, step = 1, formatValue, label }: RangeProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm tabular-nums text-berry">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-berry"
      />
    </div>
  );
}
