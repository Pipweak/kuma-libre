import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react';

import type { ButtonVariant } from '@/shared/ui/Button/Button';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  'aria-label': string;
  size?: IconButtonSize;
  variant?: ButtonVariant;
};

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  ghost: 'bg-transparent text-ink hover:bg-action-soft active:bg-canvas-accent',
  primary: 'bg-action text-white shadow-card hover:bg-action-hover active:bg-action-active',
  secondary:
    'border border-line-strong bg-surface-strong text-ink hover:border-action hover:text-action active:bg-action-soft',
};

const SIZE_STYLES: Record<IconButtonSize, string> = {
  lg: 'size-12',
  md: 'size-11',
  sm: 'size-11',
};

/** Icon-only button that requires an accessible label at compile time. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { children, className, size = 'md', type = 'button', variant = 'ghost', ...buttonProps },
  ref,
): ReactElement {
  return (
    <button
      {...buttonProps}
      className={[
        'rounded-pill focus-visible:ring-action inline-flex shrink-0 items-center justify-center transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transform-none',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      ref={ref}
      type={type}
    >
      {children}
    </button>
  );
});
