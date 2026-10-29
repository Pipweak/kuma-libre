import type { ReactElement } from 'react';

import { BrandLogo } from '@/shared/ui/BrandLogo/BrandLogo';

import styles from './AppLoader.module.scss';

export type AppLoaderProps = {
  label: string;
};

/** Branded full-page loading state used while Kuma Libre resolves application data. */
export function AppLoader({ label }: AppLoaderProps): ReactElement {
  return (
    <section aria-label={label} className={styles.loader} role="status">
      <div className={styles.content}>
        <BrandLogo alt="" aria-hidden="true" className={styles.logo} priority variant="stacked" />
        <p className={styles.label}>{label}</p>
        <span aria-hidden="true" className={styles.track}>
          <span className={styles.indicator} />
        </span>
      </div>
    </section>
  );
}
