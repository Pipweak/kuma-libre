import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

export function RootLayout(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <a
        className="sr-only z-50 rounded-md bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        href="#main-content"
      >
        {t('accessibility.skipToContent')}
      </a>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
