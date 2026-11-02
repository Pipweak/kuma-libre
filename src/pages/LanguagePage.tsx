import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/preferences/components/LanguageSelector';
import { Card } from '@/shared/ui';

export function LanguagePage(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
      <h1 className="font-display text-ink sr-only text-3xl font-black tracking-tight sm:not-sr-only sm:text-5xl">
        {t('languagePage.title')}
      </h1>
      <p className="text-muted mt-3 text-base leading-7 sm:text-lg">
        {t('languagePage.description')}
      </p>

      <Card className="mt-8 p-5 sm:p-6">
        <LanguageSelector variant="cards" />
        <p className="text-muted mt-5 text-sm leading-6">{t('languagePage.note')}</p>
      </Card>
    </section>
  );
}
