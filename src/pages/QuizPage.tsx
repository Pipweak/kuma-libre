import { X } from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { applyReviewResult, evaluateAnswer } from '@/domain/quiz';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { QuizCorrection } from '@/features/quiz/components/QuizCorrection';
import { QuizQuestion } from '@/features/quiz/components/QuizQuestion';
import {
  isQuizRouteState,
  type QuizResultRouteState,
} from '@/features/quiz/navigation/quizNavigation';
import { quizReducer } from '@/features/quiz/state/quizReducer';
import { INITIAL_QUIZ_STATE } from '@/features/quiz/state/quizState';
import { Button, Card, IconButton, ProgressBar } from '@/shared/ui';

export function QuizPage(): ReactElement {
  const { t } = useTranslation('quiz');
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const exitDialogRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  const routeState = isQuizRouteState(location.state) ? location.state : null;
  const currentQuestion = routeState?.session.questions[state.currentIndex];

  useEffect(() => {
    if (state.feedback === null) {
      inputRef.current?.focus();
    } else {
      nextButtonRef.current?.focus();
    }
  }, [state.currentIndex, state.feedback]);

  useEffect(() => {
    if (!isExitDialogOpen) {
      return;
    }

    continueButtonRef.current?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsExitDialogOpen(false);
        exitButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements =
        exitDialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
      if (focusableElements === undefined || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0]!;
      const lastElement = focusableElements[focusableElements.length - 1]!;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
    };
  }, [isExitDialogOpen]);

  if (routeState === null || currentQuestion === undefined) {
    return <Navigate replace to="/app/quiz/configure?session=missing" />;
  }

  const currentPosition = state.currentIndex + 1;
  const lesson = vocabularyCorpus.lessons.find(
    (candidate) => candidate.id === currentQuestion.lessonId,
  );
  const lessonNumber = lesson ? formatLessonNumber(lesson.number) : '';
  const isAnswerEmpty = state.answer.trim().length === 0;

  const submitAnswer = (isSkipped: boolean): void => {
    if (state.feedback !== null || (!isSkipped && isAnswerEmpty)) {
      return;
    }

    const evaluation = isSkipped
      ? { isCorrect: false }
      : evaluateAnswer(state.answer, currentQuestion.acceptedAnswers);
    const transition = applyReviewResult(undefined, evaluation.isCorrect);

    dispatch({
      feedback: {
        answer: isSkipped ? '' : state.answer,
        isCorrect: evaluation.isCorrect,
        isSkipped,
        transition,
      },
      type: 'answer-evaluated',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    submitAnswer(false);
  };

  const handleNext = (): void => {
    if (state.feedback === null) {
      return;
    }

    if (currentPosition === routeState.session.total) {
      const resultState: QuizResultRouteState = {
        correctCount: state.correctCount,
        incorrectCount: state.incorrectCount,
        total: routeState.session.total,
      };
      void navigate('/app/quiz/result', { replace: true, state: resultState });
      return;
    }

    dispatch({ type: 'next-question' });
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <header className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
        <IconButton
          aria-label={t('exit.open')}
          onClick={() => {
            setIsExitDialogOpen(true);
          }}
          ref={exitButtonRef}
          variant="secondary"
        >
          <X aria-hidden="true" size={20} />
        </IconButton>
        <ProgressBar
          label={t('question.progress', {
            current: currentPosition,
            total: routeState.session.total,
          })}
          max={routeState.session.total}
          value={currentPosition}
        />
        <span aria-hidden="true" className="size-11" />
      </header>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {lessonNumber ? (
          <span className="bg-canvas-accent text-muted rounded-pill px-3 py-1 text-xs font-bold">
            {t('question.lesson', { number: lessonNumber })}
          </span>
        ) : null}
        <span className="bg-action-soft text-action rounded-pill px-3 py-1 text-xs font-bold">
          {t(`direction.${routeState.session.direction}`)}
        </span>
      </div>

      <QuizQuestion question={currentQuestion} />

      <form className="mt-auto space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-ink mb-2 block text-sm font-black" htmlFor="quiz-answer">
            {t('answer.label')}
          </label>
          <input
            aria-describedby={state.feedback === null ? undefined : 'quiz-correction'}
            autoComplete="off"
            className={[
              'rounded-control bg-surface-strong text-ink placeholder:text-muted min-h-12 w-full border px-4 text-base shadow-sm transition-colors focus:outline-none',
              state.feedback === null
                ? 'border-line-strong focus:border-action focus:ring-action focus:ring-2'
                : state.feedback.isCorrect
                  ? 'border-success bg-success-soft'
                  : 'border-danger bg-danger-soft',
            ].join(' ')}
            id="quiz-answer"
            onChange={(event) => {
              dispatch({ answer: event.target.value, type: 'answer-changed' });
            }}
            placeholder={t(
              currentQuestion.direction === 'comprehension'
                ? 'answer.placeholderComprehension'
                : 'answer.placeholderProduction',
            )}
            readOnly={state.feedback !== null}
            ref={inputRef}
            value={state.answer}
          />
        </div>

        {state.feedback === null ? (
          <div className="grid gap-2">
            <Button disabled={isAnswerEmpty} size="lg" type="submit">
              {t('answer.validate')}
            </Button>
            <Button
              onClick={() => {
                submitAnswer(true);
              }}
              size="lg"
              variant="ghost"
            >
              {t('answer.skip')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" id="quiz-correction">
            <QuizCorrection feedback={state.feedback} question={currentQuestion} />
            <Button className="w-full" onClick={handleNext} ref={nextButtonRef} size="lg">
              {t('correction.next')}
            </Button>
          </div>
        )}
      </form>

      {isExitDialogOpen ? (
        <div
          aria-describedby="exit-dialog-description"
          aria-labelledby="exit-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExitDialogOpen(false);
              exitButtonRef.current?.focus();
            }
          }}
          role="dialog"
        >
          <Card className="w-full max-w-md p-6 shadow-xl" ref={exitDialogRef}>
            <h2 className="text-ink text-xl font-black" id="exit-dialog-title">
              {t('exit.title')}
            </h2>
            <p className="text-muted mt-2 leading-6" id="exit-dialog-description">
              {t('exit.description')}
            </p>
            <div className="mt-6 grid gap-2">
              <Button
                onClick={() => {
                  void navigate('/app/lessons');
                }}
                variant="secondary"
              >
                {t('exit.confirm')}
              </Button>
              <Button
                onClick={() => {
                  setIsExitDialogOpen(false);
                  exitButtonRef.current?.focus();
                }}
                ref={continueButtonRef}
              >
                {t('exit.cancel')}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
