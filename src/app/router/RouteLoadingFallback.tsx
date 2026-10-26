import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@/shared/ui';

/** Accessible fallback displayed while the first lazy route chunk is loading. */
export function RouteLoadingFallback(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <div className="bg-canvas flex min-h-dvh items-center justify-center p-6">
      <Spinner label={t('app.loading')} size="lg" />
    </div>
  );
}
