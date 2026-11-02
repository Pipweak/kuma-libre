import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router';

import { isQuizResultRouteState } from '@/features/quiz/navigation/quizNavigation';
import styles from '@/pages/QuizResultPage.module.scss';
import { Card } from '@/shared/ui';

export function QuizResultPage(): ReactElement {
  const { t } = useTranslation('quiz');
  const location = useLocation();

  if (!isQuizResultRouteState(location.state)) {
    return <Navigate replace to="/app/lessons" />;
  }

  const result = location.state;

  return (
    <section
      className={`mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-4 py-10 text-center sm:px-6 ${styles.page}`}
    >
      <span
        className={`bg-success mx-auto flex size-16 items-center justify-center rounded-full text-white shadow-sm ${styles.completionMark}`}
      >
        <Check aria-hidden="true" size={32} />
      </span>
      <h1 className="text-ink mt-5 text-3xl font-black sm:text-4xl">{t('result.title')}</h1>
      <p className="text-muted mt-2">{t('result.description')}</p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <strong className="text-ink text-2xl font-black">{result.total}</strong>
          <span className="text-muted mt-1 block text-xs font-semibold">{t('result.total')}</span>
        </Card>
        <Card className="border-success p-4">
          <strong className="text-success text-2xl font-black">{result.correctCount}</strong>
          <span className="text-muted mt-1 block text-xs font-semibold">{t('result.correct')}</span>
        </Card>
        <Card className="border-danger p-4">
          <strong className="text-danger text-2xl font-black">{result.incorrectCount}</strong>
          <span className="text-muted mt-1 block text-xs font-semibold">
            {t('result.incorrect')}
          </span>
        </Card>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          className="bg-action hover:bg-action-hover focus-visible:ring-action rounded-control inline-flex min-h-12 items-center justify-center px-5 font-bold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          to="/app/quiz/configure"
        >
          {t('result.newSession')}
        </Link>
        <Link
          className="border-line-strong bg-surface-strong text-ink hover:border-action hover:text-action focus-visible:ring-action rounded-control inline-flex min-h-12 items-center justify-center border px-5 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          to="/app"
        >
          {t('result.backToHome')}
        </Link>
      </div>
    </section>
  );
}
