import type { ReactElement } from 'react';

import styles from '@/shared/ui/Spinner/Spinner.module.scss';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  className?: string;
  label?: string;
  size?: SpinnerSize;
};

const SIZE_STYLES: Record<SpinnerSize, string | undefined> = {
  lg: styles.large,
  md: undefined,
  sm: styles.small,
};

/** Displays a reduced-motion-aware progress indicator, decorative unless a label is provided. */
export function Spinner({ className, label, size = 'md' }: SpinnerProps): ReactElement {
  const spinnerClassName = [styles.spinner, SIZE_STYLES[size]].filter(Boolean).join(' ');
  const containerClassName = [styles.container, className].filter(Boolean).join(' ');

  if (label) {
    return (
      <span aria-label={label} className={containerClassName} role="status">
        <span aria-hidden="true" className={spinnerClassName} />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={containerClassName}>
      <span className={spinnerClassName} />
    </span>
  );
}
