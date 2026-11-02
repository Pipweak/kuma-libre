import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AppLoader } from '@/shared/ui';

/** Accessible fallback displayed while the first lazy route chunk is loading. */
export function RouteLoadingFallback(): ReactElement {
  const { t } = useTranslation('common');

  return <AppLoader label={t('app.loading')} />;
}
