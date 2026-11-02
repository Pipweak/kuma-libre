import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LOCALES, type SupportedLocale } from '@/shared/i18n/i18n';
import { FlagIcon } from '@/shared/ui';

const LANGUAGE_LABEL_KEYS: Record<SupportedLocale, string> = {
  fr: 'languages.fr',
  en: 'languages.en',
  es: 'languages.es',
};

export type LanguageSelectorProps = {
  variant?: 'cards' | 'compact';
};

export function LanguageSelector({ variant = 'compact' }: LanguageSelectorProps): ReactElement {
  const { i18n, t } = useTranslation('common');
  const currentLanguage = i18n.resolvedLanguage;

  const handleLanguageChange = (locale: SupportedLocale): void => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      aria-label={t('languageSelector.label')}
      className={variant === 'cards' ? 'grid gap-3' : 'flex flex-wrap gap-2'}
      role="group"
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const isSelected = currentLanguage === locale;

        return (
          <button
            aria-pressed={isSelected}
            className={
              variant === 'cards'
                ? 'border-line-strong bg-surface text-ink hover:border-action focus-visible:ring-action aria-pressed:border-action aria-pressed:bg-action-soft rounded-card flex min-h-16 w-full items-center gap-4 border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.99] motion-reduce:transform-none'
                : 'rounded-pill border-line-strong bg-surface-strong text-ink ease-kl-out hover:border-action hover:text-action focus-visible:ring-action aria-pressed:border-action aria-pressed:bg-action min-h-11 border px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none aria-pressed:text-white'
            }
            key={locale}
            onClick={() => {
              handleLanguageChange(locale);
            }}
            type="button"
          >
            {variant === 'cards' ? (
              <>
                <FlagIcon className="h-6 w-9" code={locale} />
                <span className="min-w-0 flex-1">
                  <strong className="block text-base">{t(LANGUAGE_LABEL_KEYS[locale])}</strong>
                  <small className="text-muted mt-0.5 block text-sm">
                    {t(`languageSelector.descriptions.${locale}`)}
                  </small>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? 'bg-action text-white' : 'border-line border text-transparent'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </span>
              </>
            ) : (
              t(LANGUAGE_LABEL_KEYS[locale])
            )}
          </button>
        );
      })}
    </div>
  );
}
