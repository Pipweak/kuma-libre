import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { summarizeProgress } from '@/domain/progress';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { LessonProgressLink } from '@/features/progress/components/LessonProgressLink';
import { useProgress } from '@/features/progress/useProgress';
import { QuickReviewCard } from '@/features/quiz/components/QuickReviewCard';

const FEATURED_LESSON_COUNT = 3;

export function HomePage(): ReactElement {
  const { t } = useTranslation('lessons');
  const { progress } = useProgress();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
      <header>
        <p className="text-action text-xs font-black tracking-[0.16em] uppercase">
          {t('home.eyebrow')}
        </p>
        <h1 className="font-display text-ink mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {t('home.title')}
        </h1>
      </header>

      <div className="mt-6">
        <QuickReviewCard />
      </div>

      <section className="mt-9" aria-labelledby="home-lessons-title">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-ink text-lg font-black" id="home-lessons-title">
            {t('home.lessons')}
          </h2>
          <Link
            className="text-muted hover:text-action focus-visible:ring-action rounded-control inline-flex min-h-11 items-center px-2 text-sm font-bold focus-visible:ring-2 focus-visible:outline-none"
            to="/app/lessons"
          >
            {t('home.viewAll')}
          </Link>
        </div>

        <ol className="mt-3 grid gap-3">
          {vocabularyCorpus.lessons.slice(0, FEATURED_LESSON_COUNT).map((lesson) => {
            const entryIds = vocabularyCorpus.entries
              .filter((entry) => entry.lessonId === lesson.id)
              .map((entry) => entry.id);

            return (
              <li key={lesson.id}>
                <LessonProgressLink
                  entryCount={lesson.entryCount}
                  lessonId={lesson.id}
                  lessonNumber={formatLessonNumber(lesson.number)}
                  summary={summarizeProgress(entryIds, progress)}
                />
              </li>
            );
          })}
        </ol>
      </section>
    </section>
  );
}
