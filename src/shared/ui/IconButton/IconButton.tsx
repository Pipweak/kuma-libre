import type { ButtonHTMLAttributes, ReactElement } from 'react';

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
export function IconButton({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'ghost',
  ...buttonProps
}: IconButtonProps): ReactElement {
  return (
    <button
      {...buttonProps}
      className={[
        'rounded-pill ease-kl-out focus-visible:ring-action inline-flex shrink-0 items-center justify-center transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
    >
      {children}
    </button>
  );
}
