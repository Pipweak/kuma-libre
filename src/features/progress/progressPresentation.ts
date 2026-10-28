import type { SupportedLocale } from '@/shared/i18n/i18n';

/** Formats an integer mastery percentage with locale-aware spacing and symbols. */
export function formatMasteryPercentage(percentage: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(percentage / 100);
}
