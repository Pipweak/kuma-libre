import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { summarizeProgress } from '@/domain/progress';
import {
  formatLessonNumber,
  getJapaneseReading,
  getLocalizedMeaning,
  getPrimaryJapaneseForm,
} from '@/features/lessons/lessonPresentation';
import { MasteryStatusPair } from '@/features/progress/components/MasteryStatusPair';
import { ProgressOverview } from '@/features/progress/components/ProgressOverview';
import { useProgress } from '@/features/progress/useProgress';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Card } from '@/shared/ui';

export function LessonPage(): ReactElement {
  const { i18n, t } = useTranslation(['lessons', 'progress']);
  const { progress } = useProgress();
  const { lessonId } = useParams();
  const locale = resolveSupportedLocale(i18n.resolvedLanguage);
  const lesson = vocabularyCorpus.lessons.find((candidate) => candidate.id === lessonId);

  if (lesson === undefined) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-ink text-3xl font-black">{t('notFound.title')}</h1>
        <p className="text-muted mt-3">{t('notFound.description')}</p>
        <Link className="text-action mt-6 inline-flex font-bold hover:underline" to="/app/lessons">
          {t('backToLessons')}
        </Link>
      </section>
    );
  }

  const lessonNumber = formatLessonNumber(lesson.number);
  const entries = vocabularyCorpus.entries.filter((entry) => entry.lessonId === lesson.id);
  const populatedCategories = vocabularyCorpus.categories.flatMap((category) => {
    const categoryEntries = entries.filter((entry) => entry.categoryId === category.id);
    return categoryEntries.length === 0 ? [] : [{ category, entries: categoryEntries }];
  });
  const lessonSummary = summarizeProgress(
    entries.map((entry) => entry.id),
    progress,
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-center gap-5">
          <span className="bg-action-soft text-action rounded-panel flex size-20 shrink-0 items-center justify-center text-2xl font-black sm:size-24">
            {lessonNumber}
          </span>
          <div>
            <p className="text-action text-xs font-bold tracking-[0.16em] uppercase">
              {t('corpusLabel')}
            </p>
            <h1 className="text-ink mt-1 text-3xl font-black sm:text-4xl">
              {t('lessonLabel', { number: lessonNumber })}
            </h1>
            <p className="text-muted mt-2">
              {t('entryCount', { count: lesson.entryCount })} ·{' '}
              {t('categoryCount', { count: populatedCategories.length })}
            </p>
          </div>
        </div>
        <Link
          className="bg-action hover:bg-action-hover focus-visible:ring-action rounded-control inline-flex min-h-12 items-center justify-center px-6 font-bold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none"
          to={`/app/quiz/configure?lesson=${lesson.id}`}
        >
          {t('reviewLesson')}
        </Link>
      </div>

      <div className="mt-8">
        <ProgressOverview summary={lessonSummary} />
      </div>

      <div className="mt-10 space-y-8">
        {populatedCategories.map(({ category, entries: categoryEntries }) => (
          <section aria-labelledby={`category-${category.id}`} key={category.id}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-ink text-xl font-black" id={`category-${category.id}`}>
                  {category.labels[locale]}
                </h2>
                <p className="text-muted mt-1 text-xs">{t('progress:statusLegend')}</p>
              </div>
              <span className="text-muted text-sm">
                {t('entryCount', { count: categoryEntries.length })}
              </span>
            </div>
            <Card className="divide-line divide-y overflow-hidden">
              {categoryEntries.map((entry) => {
                const meaning = getLocalizedMeaning(entry, locale);
                const reading = getJapaneseReading(entry);

                return (
                  <article
                    className="grid grid-cols-[minmax(5.5rem,0.75fr)_minmax(6rem,1fr)_auto] items-center gap-2 px-3 py-4 sm:grid-cols-[minmax(10rem,0.8fr)_1.2fr_auto] sm:gap-6 sm:px-5"
                    key={entry.id}
                  >
                    <div className="min-w-0">
                      <strong className="font-japanese text-ink block text-lg" lang="ja">
                        {getPrimaryJapaneseForm(entry)}
                      </strong>
                      {reading ? (
                        <span className="font-japanese text-muted mt-0.5 block text-sm">
                          {reading}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={
                        meaning === null ? 'text-warning text-sm font-semibold' : 'text-ink'
                      }
                    >
                      {meaning ?? t('translationUnavailable')}
                    </p>
                    <MasteryStatusPair progress={progress[entry.id]} />
                  </article>
                );
              })}
            </Card>
          </section>
        ))}
      </div>
    </section>
  );
}
