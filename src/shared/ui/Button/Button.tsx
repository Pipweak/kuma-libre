import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react';

import { Spinner } from '@/shared/ui/Spinner/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  ghost: 'bg-transparent text-ink hover:bg-action-soft active:bg-canvas-accent',
  primary:
    'bg-action text-white shadow-card hover:bg-action-hover active:bg-action-active disabled:shadow-none',
  secondary:
    'border border-line-strong bg-surface-strong text-ink hover:border-action hover:text-action active:bg-action-soft',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  lg: 'min-h-12 px-6 text-base',
  md: 'min-h-11 px-5 text-sm',
  sm: 'min-h-11 px-4 text-sm',
};

/** Shared Kuma Libre action button with consistent variants, focus, and loading semantics. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled = false,
    isLoading = false,
    loadingLabel,
    size = 'md',
    type = 'button',
    variant = 'primary',
    ...buttonProps
  },
  ref,
): ReactElement {
  const label = isLoading && loadingLabel ? loadingLabel : children;

  return (
    <button
      {...buttonProps}
      aria-busy={isLoading}
      className={[
        'rounded-control ease-kl-out focus-visible:ring-action inline-flex items-center justify-center gap-2 font-bold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || isLoading}
      ref={ref}
      type={type}
    >
      {isLoading ? <Spinner size="sm" /> : null}
      {label}
    </button>
  );
});
