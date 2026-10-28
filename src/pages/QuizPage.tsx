import { X } from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { evaluateAnswer } from '@/domain/quiz';
import type { ReviewSubmission } from '@/domain/progress';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { useProgress } from '@/features/progress/useProgress';
import { QuizCorrection } from '@/features/quiz/components/QuizCorrection';
import { QuizQuestion } from '@/features/quiz/components/QuizQuestion';
import { DictationInput } from '@/features/speech/components/DictationInput';
import { QuestionAudioButton } from '@/features/speech/components/QuestionAudioButton';
import { getAnswerSpeechLanguage } from '@/features/speech/speechPresentation';
import {
  isQuizRouteState,
  type QuizResultRouteState,
} from '@/features/quiz/navigation/quizNavigation';
import { quizReducer } from '@/features/quiz/state/quizReducer';
import { INITIAL_QUIZ_STATE } from '@/features/quiz/state/quizState';
import { resolveSupportedLocale } from '@/shared/i18n/i18n';
import { Button, Card, IconButton, ProgressBar } from '@/shared/ui';

export function QuizPage(): ReactElement {
  const { i18n, t } = useTranslation('quiz');
  const location = useLocation();
  const navigate = useNavigate();
  const { recordReview } = useProgress();
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [pendingReview, setPendingReview] = useState<ReviewSubmission | null>(null);
  const [reviewSaveFailed, setReviewSaveFailed] = useState(false);
  const questionStartedAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const exitDialogRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  const routeState = isQuizRouteState(location.state) ? location.state : null;
  const currentQuestion = routeState?.session.questions[state.currentIndex];

  useEffect(() => {
    questionStartedAtRef.current = Date.now();
  }, [state.currentIndex]);

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

  const persistReview = async (review: ReviewSubmission): Promise<void> => {
    if (isSavingReview) {
      return;
    }

    setIsSavingReview(true);
    setReviewSaveFailed(false);

    try {
      const transition = await recordReview(review);
      dispatch({
        feedback: {
          answer: review.submittedAnswer,
          isCorrect: review.result === 'correct',
          isSkipped: review.result === 'skipped',
          transition,
        },
        type: 'answer-evaluated',
      });
      setPendingReview(null);
    } catch {
      setReviewSaveFailed(true);
    } finally {
      setIsSavingReview(false);
    }
  };

  const submitAnswer = (isSkipped: boolean): void => {
    if (
      state.feedback !== null ||
      isSavingReview ||
      pendingReview !== null ||
      (!isSkipped && isAnswerEmpty)
    ) {
      return;
    }

    const evaluation = isSkipped
      ? { isCorrect: false, normalizedAnswer: '' }
      : evaluateAnswer(state.answer, currentQuestion.acceptedAnswers);
    const review: ReviewSubmission = {
      direction: currentQuestion.direction,
      entryId: currentQuestion.entryId,
      id: crypto.randomUUID(),
      normalizedAnswer: evaluation.normalizedAnswer,
      promptSnapshot: currentQuestion.prompt,
      responseTimeMs: Date.now() - questionStartedAtRef.current,
      result: isSkipped ? 'skipped' : evaluation.isCorrect ? 'correct' : 'incorrect',
      submittedAnswer: isSkipped ? '' : state.answer,
    };

    setPendingReview(review);
    void persistReview(review);
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

    setPendingReview(null);
    setReviewSaveFailed(false);
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

      <QuizQuestion
        audioControl={
          <QuestionAudioButton
            key={`${currentQuestion.entryId}-${state.currentIndex}`}
            question={currentQuestion}
          />
        }
        question={currentQuestion}
      />

      <form className="mt-auto space-y-4" onSubmit={handleSubmit}>
        <DictationInput
          {...(state.feedback === null ? {} : { describedBy: 'quiz-correction' })}
          className={
            state.feedback === null
              ? 'border-line-strong focus:border-action focus:ring-action focus:ring-2'
              : state.feedback.isCorrect
                ? 'border-success bg-success-soft'
                : 'border-danger bg-danger-soft'
          }
          id="quiz-answer"
          label={t('answer.label')}
          language={getAnswerSpeechLanguage(
            currentQuestion,
            resolveSupportedLocale(i18n.resolvedLanguage ?? i18n.language),
          )}
          onValueChange={(answer) => {
            dispatch({ answer, type: 'answer-changed' });
          }}
          placeholder={t(
            currentQuestion.direction === 'comprehension'
              ? 'answer.placeholderComprehension'
              : 'answer.placeholderProduction',
          )}
          readOnly={state.feedback !== null || isSavingReview || pendingReview !== null}
          ref={inputRef}
          resetKey={`${currentQuestion.entryId}-${state.currentIndex}`}
          value={state.answer}
        />

        {state.feedback === null ? (
          <div className="grid gap-2">
            {reviewSaveFailed && pendingReview !== null ? (
              <Card className="border-danger bg-danger-soft p-4" role="alert">
                <p className="text-ink font-bold">{t('persistence.errorTitle')}</p>
                <p className="text-muted mt-1 text-sm">{t('persistence.errorDescription')}</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    void persistReview(pendingReview);
                  }}
                  size="lg"
                  variant="secondary"
                >
                  {t('persistence.retry')}
                </Button>
              </Card>
            ) : null}
            <Button
              disabled={isAnswerEmpty || pendingReview !== null}
              isLoading={isSavingReview}
              loadingLabel={t('persistence.saving')}
              size="lg"
              type="submit"
            >
              {t('answer.validate')}
            </Button>
            <Button
              disabled={pendingReview !== null}
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
