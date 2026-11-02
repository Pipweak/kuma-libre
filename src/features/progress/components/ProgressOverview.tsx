import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProgressSummary } from '@/domain/progress';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Card, ProgressBar } from '@/shared/ui';

export type ProgressOverviewProps = {
  summary: ProgressSummary;
};

/** Displays the three V1 mastery indicators without introducing detailed analytics. */
export function ProgressOverview({ summary }: ProgressOverviewProps): ReactElement {
  const { i18n, t } = useTranslation('progress');
  const locale = resolveSupportedLocale(i18n.resolvedLanguage);
  const percentageFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: 'percent',
  });
  const formatPercentage = (percentage: number): string =>
    percentageFormatter.format(percentage / 100);
  const overallPercentage = formatPercentage(summary.overall.percentage);

  return (
    <Card className="overflow-hidden">
      <div className="bg-ink flex items-center gap-4 p-5 text-white sm:p-6">
        <div
          aria-label={t('percentageLabel', {
            label: t('overall'),
            percentage: overallPercentage,
          })}
          className="grid size-20 shrink-0 place-items-center rounded-full p-2 sm:size-24"
          role="img"
          style={{
            background: `conic-gradient(var(--kl-color-action) ${summary.overall.percentage}%, rgb(255 255 255 / 15%) 0)`,
          }}
        >
          <span className="bg-ink grid size-full place-items-center rounded-full text-xl font-black sm:text-2xl">
            {overallPercentage}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.14em] text-white/65 uppercase">
            {t('overall')}
          </p>
          <strong className="mt-1 block text-xl font-black sm:text-2xl">
            {t('masteredInBoth', { count: summary.overall.masteredCount })}
          </strong>
          <p className="mt-1 text-sm text-white/65">
            {t('entryTotal', { count: summary.overall.totalCount })}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <ProgressBar
          label={t('comprehension')}
          max={100}
          tone="ink"
          value={summary.comprehension.percentage}
          valueLabel={formatPercentage(summary.comprehension.percentage)}
        />
        <ProgressBar
          label={t('production')}
          max={100}
          value={summary.production.percentage}
          valueLabel={formatPercentage(summary.production.percentage)}
        />
      </div>
    </Card>
  );
}
