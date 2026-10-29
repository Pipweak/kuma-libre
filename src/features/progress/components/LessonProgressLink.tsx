import { ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { ProgressSummary } from '@/domain/progress';
import { formatMasteryPercentage } from '@/features/progress/progressPresentation';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Card } from '@/shared/ui';

export type LessonProgressLinkProps = {
  entryCount: number;
  lessonId: string;
  lessonNumber: string;
  summary: ProgressSummary;
};

export function LessonProgressLink({
  entryCount,
  lessonId,
  lessonNumber,
  summary,
}: LessonProgressLinkProps): ReactElement {
  const { i18n, t } = useTranslation(['lessons', 'progress']);
  const locale = resolveSupportedLocale(i18n.resolvedLanguage);
  const percentage = formatMasteryPercentage(summary.overall.percentage, locale);
  const lessonLabel = t('lessonLabel', { number: lessonNumber });

  return (
    <Link
      className="focus-visible:ring-action rounded-card group block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      to={`/app/lessons/${lessonId}`}
    >
      <Card className="hover:border-action flex min-h-16 items-center gap-3 p-3 transition-[border-color,transform,box-shadow] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] group-hover:-translate-y-0.5 group-hover:shadow-md motion-reduce:transform-none">
        <span className="bg-action-soft text-action-active rounded-control flex size-10 shrink-0 items-center justify-center text-sm font-black">
          {lessonNumber}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="text-ink block text-sm">{lessonLabel}</strong>
          <small className="text-muted mt-0.5 block text-xs">
            {t('entryCount', { count: entryCount })}
          </small>
        </span>
        <span className="text-right">
          <strong className="text-ink block text-sm">{percentage}</strong>
          <small className="text-muted mt-0.5 hidden text-xs sm:block">
            {t('progress:masteredLabel')}
          </small>
        </span>
        <ChevronRight
          aria-hidden="true"
          className="text-muted group-hover:text-action shrink-0 transition-colors"
          size={20}
        />
      </Card>
    </Link>
  );
}
