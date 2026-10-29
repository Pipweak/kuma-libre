import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router';

import { createLoginPath } from '@/features/auth/authNavigation';
import { useAuth } from '@/features/auth/useAuth';
import { AppHeader } from '@/features/navigation/components/AppHeader';
import { useProgress } from '@/features/progress/useProgress';
import { AppLoader, Button, Card } from '@/shared/ui';

export function AppLayout(): ReactElement {
  const { t } = useTranslation('common');
  const { pathname, search } = useLocation();
  const { session, status } = useAuth();
  const progress = useProgress();
  const isQuizSession = pathname === '/app/quiz';

  if (status === 'initializing') {
    return <AppLoader label={t('app.loadingSession')} />;
  }

  if (status === 'anonymous' || !session) {
    return <Navigate replace to={createLoginPath(`${pathname}${search}`)} />;
  }

  if (progress.status === 'idle' || progress.status === 'loading') {
    return <AppLoader label={t('app.loadingProgress')} />;
  }

  if (progress.status === 'error') {
    return (
      <div className="bg-canvas flex min-h-dvh items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 text-center" role="alert">
          <h1 className="text-ink text-xl font-black">{t('app.progressErrorTitle')}</h1>
          <p className="text-muted mt-2 leading-6">{t('app.progressErrorDescription')}</p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              void progress.reload();
            }}
          >
            {t('app.retryProgress')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-dvh">
      {isQuizSession ? null : <AppHeader pathname={pathname} user={session.user} />}
      <Outlet />
    </div>
  );
}
