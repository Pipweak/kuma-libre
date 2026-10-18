import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/preferences/components/LanguageSelector';
import { BrandLogo, Card } from '@/shared/ui';

export function LandingPage(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <section className="bg-canvas min-h-dvh px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <BrandLogo alt="" aria-hidden="true" className="w-44 sm:w-52" priority />

        <div className="space-y-4">
          <p className="text-action text-sm font-bold tracking-[0.18em] uppercase">
            {t('landing.eyebrow')}
          </p>
          <h1 className="font-display text-ink text-4xl font-black tracking-tight sm:text-6xl">
            {t('landing.title')}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-8">{t('landing.description')}</p>
        </div>

        <Card className="p-6 sm:p-8">
          <h2 className="text-ink text-lg font-bold">{t('foundation.title')}</h2>
          <p className="text-muted mt-2 leading-7">{t('foundation.description')}</p>
        </Card>

        <div className="space-y-3">
          <p className="text-muted text-sm font-semibold">{t('languageSelector.prompt')}</p>
          <LanguageSelector />
        </div>
      </div>
    </section>
  );
}
