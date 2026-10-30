import { ArrowRight, SlidersHorizontal, Zap } from 'lucide-react';
import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { buildQuickReviewSession } from '@/domain/quiz';
import { useProgress } from '@/features/progress/useProgress';
import type { QuizRouteState } from '@/features/quiz/navigation/quizNavigation';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Button, Card } from '@/shared/ui';

export type QuickReviewCardProps = {
  variant?: 'compact' | 'full';
};

/** Builds the V1 quick-review preset and keeps session creation out of presentation pages. */
export function QuickReviewCard({ variant = 'full' }: QuickReviewCardProps): ReactElement {
  const { i18n, t } = useTranslation('quiz');
  const navigate = useNavigate();
  const { progress } = useProgress();
  const locale = resolveSupportedLocale(i18n.resolvedLanguage);
  const session = useMemo(
    () =>
      buildQuickReviewSession(vocabularyCorpus.entries, progress, {
        direction: 'comprehension',
        locale,
      }),
    [locale, progress],
  );

  const handleStart = (): void => {
    if (session.total === 0) {
      return;
    }

    const state: QuizRouteState = { session };
    void navigate('/app/quiz', { state });
  };

  return (
    <Card className={`relative overflow-hidden ${variant === 'compact' ? 'p-4' : 'p-5 sm:p-6'}`}>
      <span
        aria-hidden="true"
        className="bg-action-soft absolute -top-12 -right-12 size-36 rounded-full"
      />
      <div className="relative">
        <p className="text-action flex items-center gap-2 text-xs font-black tracking-[0.14em] uppercase">
          <Zap aria-hidden="true" size={15} />
          {t('quickReview.eyebrow')}
        </p>
        <h2
          className={`text-ink mt-2 font-black ${variant === 'compact' ? 'text-lg' : 'text-2xl'}`}
        >
          {t('quickReview.title')}
        </h2>
        <p className="text-muted mt-1 text-sm leading-6">
          {session.total > 0
            ? t('quickReview.available', { count: session.total })
            : t('quickReview.empty')}
        </p>

        <div
          className={`mt-5 grid gap-2 ${variant === 'compact' ? 'sm:grid-cols-2' : 'sm:grid-cols-[1fr_auto]'}`}
        >
          <Button disabled={session.total === 0} onClick={handleStart}>
            {t('quickReview.start')}
            <ArrowRight aria-hidden="true" size={17} />
          </Button>
          <Link
            className="border-line-strong text-ink hover:border-action hover:text-action focus-visible:ring-action rounded-control inline-flex min-h-11 items-center justify-center gap-2 border bg-white px-5 text-sm font-bold transition-[color,border-color,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none"
            to="/app/quiz/configure"
          >
            <SlidersHorizontal aria-hidden="true" size={17} />
            {t('quickReview.configure')}
          </Link>
        </div>
      </div>
    </Card>
  );
}
