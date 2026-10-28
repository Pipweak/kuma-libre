import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { summarizeProgress } from '@/domain/progress';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { LessonProgressLink } from '@/features/progress/components/LessonProgressLink';
import { useProgress } from '@/features/progress/useProgress';

export function LessonsPage(): ReactElement {
  const { t } = useTranslation('lessons');
  const { progress } = useProgress();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl space-y-3">
        <p className="text-action text-sm font-bold tracking-[0.16em] uppercase">
          {t('corpusLabel')}
        </p>
        <h1 className="font-display text-ink text-3xl font-black tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="text-muted text-base leading-7 sm:text-lg">{t('description')}</p>
      </div>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vocabularyCorpus.lessons.map((lesson) => {
          const lessonNumber = formatLessonNumber(lesson.number);
          const entryIds = vocabularyCorpus.entries
            .filter((entry) => entry.lessonId === lesson.id)
            .map((entry) => entry.id);

          return (
            <li key={lesson.id}>
              <LessonProgressLink
                entryCount={lesson.entryCount}
                lessonId={lesson.id}
                lessonNumber={lessonNumber}
                summary={summarizeProgress(entryIds, progress)}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
