import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import {
  buildQuizSession,
  type MasteryLevel,
  type QuizDirection,
  type QuizOrder,
} from '@/domain/quiz';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import type { QuizRouteState } from '@/features/quiz/navigation/quizNavigation';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Button, Card, FlagIcon } from '@/shared/ui';

const MASTERY_LEVELS: readonly MasteryLevel[] = ['red', 'yellow', 'green'];

const MASTERY_DOT_STYLES: Record<MasteryLevel, string> = {
  green: 'bg-success',
  red: 'bg-danger',
  yellow: 'bg-warning',
};

export function QuizConfigurationPage(): ReactElement {
  const { i18n, t } = useTranslation('quiz');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locale = resolveSupportedLocale(i18n.resolvedLanguage);
  const requestedLessonId = searchParams.get('lesson');
  const isSessionMissing = searchParams.get('session') === 'missing';
  const requestedLesson = vocabularyCorpus.lessons.find(
    (lesson) => lesson.id === requestedLessonId,
  );
  const [selectedLessonIds, setSelectedLessonIds] = useState<readonly string[]>(() => [
    requestedLesson?.id ?? vocabularyCorpus.lessons[0]!.id,
  ]);
  const [direction, setDirection] = useState<QuizDirection>('comprehension');
  const [includedMasteryLevels, setIncludedMasteryLevels] = useState<readonly MasteryLevel[]>([
    'red',
    'yellow',
  ]);
  const [order, setOrder] = useState<QuizOrder>('random');

  const sessionPreview = useMemo(
    () =>
      buildQuizSession(
        vocabularyCorpus.entries,
        {},
        {
          direction,
          includedMasteryLevels,
          lessonIds: selectedLessonIds,
          locale,
          order: 'corpus',
        },
      ),
    [direction, includedMasteryLevels, locale, selectedLessonIds],
  );

  const toggleLesson = (lessonId: string): void => {
    setSelectedLessonIds((current) =>
      current.includes(lessonId)
        ? current.filter((selectedId) => selectedId !== lessonId)
        : [...current, lessonId],
    );
  };

  const toggleMastery = (level: MasteryLevel): void => {
    setIncludedMasteryLevels((current) =>
      current.includes(level)
        ? current.filter((selectedLevel) => selectedLevel !== level)
        : [...current, level],
    );
  };

  const handleStart = (): void => {
    const session = buildQuizSession(
      vocabularyCorpus.entries,
      {},
      {
        direction,
        includedMasteryLevels,
        lessonIds: selectedLessonIds,
        locale,
        order,
      },
    );

    if (session.total === 0) {
      return;
    }

    const state: QuizRouteState = { session };
    void navigate('/app/quiz', { state });
  };

  const languageLabel = t(`languages.${locale}`);
  const backDestination = requestedLesson ? `/app/lessons/${requestedLesson.id}` : '/app/lessons';

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        className="text-muted hover:text-action focus-visible:ring-action rounded-control inline-flex min-h-11 items-center gap-2 font-semibold focus-visible:ring-2 focus-visible:outline-none"
        to={backDestination}
      >
        <ArrowLeft aria-hidden="true" size={18} />
        {requestedLesson ? t('configuration.back') : t('configuration.lessons')}
      </Link>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-ink text-3xl font-black tracking-tight sm:text-4xl">
          {t('configuration.title')}
        </h1>
        <p className="text-muted mt-2 leading-7">{t('configuration.description')}</p>
      </header>

      {isSessionMissing ? (
        <Card className="border-warning bg-warning-soft mt-6 p-4" role="status">
          <p className="text-ink font-semibold">{t('sessionMissing')}</p>
        </Card>
      ) : null}

      <div className="mt-8 space-y-8">
        <fieldset>
          <legend className="text-ink text-base font-black">{t('configuration.lessons')}</legend>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-9">
            {vocabularyCorpus.lessons.map((lesson) => {
              const isSelected = selectedLessonIds.includes(lesson.id);
              const lessonNumber = formatLessonNumber(lesson.number);

              return (
                <label className="cursor-pointer" key={lesson.id}>
                  <input
                    checked={isSelected}
                    className="peer sr-only"
                    onChange={() => {
                      toggleLesson(lesson.id);
                    }}
                    type="checkbox"
                  />
                  <span className="border-line-strong bg-surface peer-checked:border-action peer-checked:bg-action peer-focus-visible:ring-action rounded-control flex min-h-11 items-center justify-center border text-sm font-black transition-colors peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                    {lessonNumber}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-ink text-base font-black">{t('configuration.direction')}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(['comprehension', 'production'] as const).map((option) => {
              const isComprehension = option === 'comprehension';
              const accessibleLabel = t(
                isComprehension
                  ? 'direction.comprehensionAccessible'
                  : 'direction.productionAccessible',
                { language: languageLabel },
              );

              return (
                <label className="cursor-pointer" key={option}>
                  <input
                    checked={direction === option}
                    className="peer sr-only"
                    name="quiz-direction"
                    onChange={() => {
                      setDirection(option);
                    }}
                    type="radio"
                  />
                  <Card className="peer-checked:border-action peer-checked:bg-action-soft peer-focus-visible:ring-action flex min-h-28 flex-col justify-between gap-4 p-4 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                    <strong className="text-ink">{t(`direction.${option}`)}</strong>
                    <span
                      aria-label={accessibleLabel}
                      className="flex items-center gap-3"
                      role="img"
                    >
                      {isComprehension ? (
                        <>
                          <FlagIcon code="ja" />
                          <ArrowRight aria-hidden="true" className="text-muted" size={20} />
                          <FlagIcon code={locale} />
                        </>
                      ) : (
                        <>
                          <FlagIcon code={locale} />
                          <ArrowRight aria-hidden="true" className="text-muted" size={20} />
                          <FlagIcon code="ja" />
                        </>
                      )}
                    </span>
                  </Card>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-ink text-base font-black">{t('configuration.mastery')}</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MASTERY_LEVELS.map((level) => (
              <label className="cursor-pointer" key={level}>
                <input
                  checked={includedMasteryLevels.includes(level)}
                  className="peer sr-only"
                  onChange={() => {
                    toggleMastery(level);
                  }}
                  type="checkbox"
                />
                <span className="border-line-strong bg-surface peer-checked:border-action peer-checked:bg-action-soft peer-focus-visible:ring-action rounded-control flex min-h-14 items-center gap-3 border px-4 font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
                  <i
                    aria-hidden="true"
                    className={`size-3 shrink-0 rounded-full ${MASTERY_DOT_STYLES[level]}`}
                  />
                  {t(`mastery.${level}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-ink text-base font-black">{t('configuration.order')}</legend>
          <div className="bg-canvas-accent mt-3 grid grid-cols-2 rounded-xl p-1">
            {(['random', 'corpus'] as const).map((option) => (
              <label className="cursor-pointer" key={option}>
                <input
                  checked={order === option}
                  className="peer sr-only"
                  name="quiz-order"
                  onChange={() => {
                    setOrder(option);
                  }}
                  type="radio"
                />
                <span className="peer-checked:bg-surface-strong peer-focus-visible:ring-action rounded-control flex min-h-11 items-center justify-center px-3 text-sm font-bold transition peer-checked:shadow-sm peer-focus-visible:ring-2">
                  {t(`order.${option}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <Card className="mt-10 grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center md:sticky md:bottom-4">
        <div>
          <strong className="text-ink text-lg">
            {t('configuration.questionCount', { count: sessionPreview.total })}
          </strong>
          {sessionPreview.total === 0 ? (
            <p className="text-danger mt-1 text-sm" role="status">
              {t('configuration.empty')} {t('configuration.emptyHint')}
            </p>
          ) : null}
        </div>
        <Button disabled={sessionPreview.total === 0} onClick={handleStart} size="lg">
          {t('configuration.start')}
        </Button>
      </Card>
    </section>
  );
}
