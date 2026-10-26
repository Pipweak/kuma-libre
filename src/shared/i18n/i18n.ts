import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/shared/i18n/locales/en/common.json';
import enLessons from '@/shared/i18n/locales/en/lessons.json';
import enQuiz from '@/shared/i18n/locales/en/quiz.json';
import esCommon from '@/shared/i18n/locales/es/common.json';
import esLessons from '@/shared/i18n/locales/es/lessons.json';
import esQuiz from '@/shared/i18n/locales/es/quiz.json';
import frCommon from '@/shared/i18n/locales/fr/common.json';
import frLessons from '@/shared/i18n/locales/fr/lessons.json';
import frQuiz from '@/shared/i18n/locales/fr/quiz.json';

export const SUPPORTED_LOCALES = ['fr', 'en', 'es'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const resources = {
  en: { common: enCommon, lessons: enLessons, quiz: enQuiz },
  es: { common: esCommon, lessons: esLessons, quiz: esQuiz },
  fr: { common: frCommon, lessons: frLessons, quiz: frQuiz },
} as const;

/**
 * Resolves a browser locale to an interface locale supported by Kuma Libre.
 * French remains the deterministic fallback for unknown or missing locales.
 */
export function resolveSupportedLocale(language: string | undefined): SupportedLocale {
  const baseLanguage = language?.toLowerCase().split('-')[0];

  return SUPPORTED_LOCALES.find((locale) => locale === baseLanguage) ?? 'fr';
}

function synchronizeDocumentLanguage(language: string): void {
  document.documentElement.lang = resolveSupportedLocale(language);
}

/** Initializes the shared i18next instance once before React is mounted. */
export async function initializeI18n(): Promise<void> {
  if (i18n.isInitialized) {
    return;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: resolveSupportedLocale(navigator.language),
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });

  i18n.on('languageChanged', synchronizeDocumentLanguage);
  synchronizeDocumentLanguage(i18n.language);
}

export { i18n };
