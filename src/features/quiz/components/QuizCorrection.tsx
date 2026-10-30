import { Check, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { getMasteryLevel, type MasteryLevel, type QuizQuestion } from '@/domain/quiz';
import styles from '@/features/quiz/components/QuizCorrection.module.scss';
import type { QuizFeedback } from '@/features/quiz/state/quizState';
import { Card } from '@/shared/ui';

export type QuizCorrectionProps = {
  feedback: QuizFeedback;
  question: QuizQuestion;
};

const MASTERY_MESSAGE_KEYS: Record<MasteryLevel, string> = {
  green: 'correction.scoreGreen',
  red: 'correction.scoreRed',
  yellow: 'correction.scoreYellow',
};

export function QuizCorrection({ feedback, question }: QuizCorrectionProps): ReactElement {
  const { t } = useTranslation('quiz');
  const masteryLevel = getMasteryLevel(feedback.transition.current.score);
  const forms = [
    ...question.correction.kanji,
    ...question.correction.kana,
    ...question.correction.romaji,
  ];
  const meanings = (['fr', 'en', 'es'] as const).flatMap((locale) =>
    question.correction.meanings[locale].slice(0, 1),
  );
  const primarySolution = question.direction === 'comprehension' ? meanings : forms;
  const secondarySolution = question.direction === 'comprehension' ? forms : meanings;
  const secondaryLabel =
    question.direction === 'comprehension' ? 'correction.forms' : 'correction.meanings';

  return (
    <Card
      aria-live="polite"
      className={
        feedback.isCorrect
          ? `border-success bg-success-soft p-5 ${styles.card}`
          : `border-danger bg-danger-soft p-5 ${styles.card}`
      }
      role="status"
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={
            feedback.isCorrect
              ? 'bg-success flex size-9 items-center justify-center rounded-full text-white'
              : 'bg-danger flex size-9 items-center justify-center rounded-full text-white'
          }
        >
          {feedback.isCorrect ? <Check size={20} /> : <X size={20} />}
        </span>
        <div>
          <h2 className="text-ink text-lg font-black">
            {t(feedback.isCorrect ? 'answer.correct' : 'answer.incorrect')}
          </h2>
          <p className="text-muted mt-0.5 text-sm">{t(MASTERY_MESSAGE_KEYS[masteryLevel])}</p>
        </div>
      </header>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {!feedback.isCorrect && !feedback.isSkipped ? (
          <div>
            <dt className="text-muted text-xs font-bold tracking-wide uppercase">
              {t('correction.yourAnswer')}
            </dt>
            <dd className="text-ink mt-1 font-semibold">{feedback.answer}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted text-xs font-bold tracking-wide uppercase">
            {t(feedback.isCorrect ? 'correction.meanings' : 'correction.expectedAnswer')}
          </dt>
          <dd
            className={
              question.direction === 'production' && !feedback.isCorrect
                ? 'font-japanese text-ink mt-1'
                : 'text-ink mt-1'
            }
          >
            {(feedback.isCorrect ? meanings : primarySolution).join(' · ') || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted text-xs font-bold tracking-wide uppercase">
            {t(feedback.isCorrect ? 'correction.forms' : secondaryLabel)}
          </dt>
          <dd
            className={
              question.direction === 'comprehension' || feedback.isCorrect
                ? 'font-japanese text-ink mt-1'
                : 'text-ink mt-1'
            }
          >
            {(feedback.isCorrect ? forms : secondarySolution).join(' · ') || '—'}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
