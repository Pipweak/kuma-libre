import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/i18n/i18n';

const LANGUAGE_LABEL_KEYS: Record<SupportedLocale, string> = {
  fr: 'languages.fr',
  en: 'languages.en',
  es: 'languages.es',
};

export function LanguageSelector(): ReactElement {
  const { i18n, t } = useTranslation('common');
  const currentLanguage = i18n.resolvedLanguage;

  const handleLanguageChange = (locale: SupportedLocale): void => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div aria-label={t('languageSelector.label')} className="flex flex-wrap gap-2" role="group">
      {SUPPORTED_LOCALES.map((locale) => {
        const isSelected = currentLanguage === locale;

        return (
          <button
            aria-pressed={isSelected}
            className="min-h-11 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition-colors hover:border-red-500 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none aria-pressed:border-red-600 aria-pressed:bg-red-600 aria-pressed:text-white"
            key={locale}
            onClick={() => {
              handleLanguageChange(locale);
            }}
            type="button"
          >
            {t(LANGUAGE_LABEL_KEYS[locale])}
          </button>
        );
      })}
    </div>
  );
}
