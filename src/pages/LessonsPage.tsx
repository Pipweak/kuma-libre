import { BookOpen, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { Card } from '@/shared/ui';

export function LessonsPage(): ReactElement {
  const { t } = useTranslation('lessons');

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

          return (
            <li key={lesson.id}>
              <Link
                aria-label={`${t('lessonLabel', { number: lessonNumber })}, ${t('entryCount', { count: lesson.entryCount })}`}
                className="focus-visible:ring-action rounded-card group block focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                to={`/app/lessons/${lesson.id}`}
              >
                <Card className="hover:border-action flex min-h-28 items-center gap-4 p-4 transition-colors">
                  <span className="bg-action-soft text-action rounded-card flex size-14 shrink-0 items-center justify-center text-lg font-black">
                    {lessonNumber}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="text-ink block text-base">
                      {t('lessonLabel', { number: lessonNumber })}
                    </strong>
                    <small className="text-muted mt-1 flex items-center gap-1.5 text-sm">
                      <BookOpen aria-hidden="true" size={15} />
                      {t('entryCount', { count: lesson.entryCount })}
                    </small>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="text-muted group-hover:text-action shrink-0 transition-colors"
                    size={20}
                  />
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
