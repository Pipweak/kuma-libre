import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Outlet, useLocation } from 'react-router';

import { isAppPreviewEnabled } from '@/app/config/appPreview';
import { BrandLogo } from '@/shared/ui';

export function AppLayout(): ReactElement {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const isQuizSession = pathname === '/app/quiz';
  const isLocalPreviewEnabled = isAppPreviewEnabled(
    import.meta.env.DEV,
    import.meta.env.VITE_ENABLE_APP_PREVIEW,
  );

  if (!isLocalPreviewEnabled) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="bg-canvas min-h-dvh">
      {isQuizSession ? null : (
        <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              aria-label={t('app.goToLessons')}
              className="focus-visible:ring-action rounded-control focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              to="/app/lessons"
            >
              <BrandLogo className="w-32 sm:w-40" priority />
            </Link>
            <span className="border-warning bg-warning-soft text-ink rounded-pill border px-3 py-1 text-xs font-bold">
              {t('app.localPreview')}
            </span>
          </div>
        </header>
      )}
      <Outlet />
    </div>
  );
}
