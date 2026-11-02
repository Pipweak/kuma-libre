import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, ScrollRestoration } from 'react-router';

export function RootLayout(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <div className="bg-canvas text-ink min-h-dvh">
      <a
        className="rounded-control bg-surface-strong shadow-card focus:ring-action sr-only z-50 px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:ring-2 focus:outline-none"
        href="#main-content"
      >
        {t('accessibility.skipToContent')}
      </a>
      <main id="main-content">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}
