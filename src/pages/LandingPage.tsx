import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/features/preferences/components/LanguageSelector';

export function LandingPage(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12 sm:px-10">
      <div className="space-y-4">
        <p className="text-sm font-bold tracking-[0.18em] text-red-700 uppercase">
          {t('landing.eyebrow')}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">
          {t('landing.title')}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-stone-600">{t('landing.description')}</p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-900">{t('foundation.title')}</h2>
        <p className="mt-2 leading-7 text-stone-600">{t('foundation.description')}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-stone-700">{t('languageSelector.prompt')}</p>
        <LanguageSelector />
      </div>
    </section>
  );
}
