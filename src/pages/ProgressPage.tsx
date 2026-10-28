import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { summarizeProgress } from '@/domain/progress';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { LessonProgressLink } from '@/features/progress/components/LessonProgressLink';
import { ProgressOverview } from '@/features/progress/components/ProgressOverview';
import { useProgress } from '@/features/progress/useProgress';

export function ProgressPage(): ReactElement {
  const { t } = useTranslation('progress');
  const { progress } = useProgress();
  const corpusSummary = summarizeProgress(
    vocabularyCorpus.entries.map((entry) => entry.id),
    progress,
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-action text-sm font-bold tracking-[0.16em] uppercase">Kuma Libre</p>
        <h1 className="font-display text-ink text-3xl font-black tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="text-muted text-base leading-7 sm:text-lg">{t('description')}</p>
      </div>

      <div className="mt-8">
        <ProgressOverview summary={corpusSummary} />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="text-ink text-xl font-black sm:text-2xl">{t('byLesson')}</h2>
        <span className="text-muted text-sm">
          {t('lessonCount', { count: vocabularyCorpus.lessons.length })}
        </span>
      </div>

      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {vocabularyCorpus.lessons.map((lesson) => {
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
  );
}
