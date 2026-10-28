import { BookOpen, ChevronRight } from 'lucide-react';
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
      <Card className="hover:border-action flex min-h-28 items-center gap-4 p-4 transition-colors">
        <span className="bg-action-soft text-action-active rounded-card flex size-14 shrink-0 items-center justify-center text-lg font-black">
          {lessonNumber}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="text-ink block text-base">{lessonLabel}</strong>
          <small className="text-muted mt-1 flex items-center gap-1.5 text-sm">
            <BookOpen aria-hidden="true" size={15} />
            {t('entryCount', { count: entryCount })}
          </small>
        </span>
        <span className="text-right">
          <strong className="text-ink block text-sm">{percentage}</strong>
          <small className="text-muted mt-0.5 block text-xs">{t('progress:masteredLabel')}</small>
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
