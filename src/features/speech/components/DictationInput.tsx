import { Check, Mic, Square, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactElement,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@/features/speech/components/DictationInput.module.scss';
import { dictationReducer, INITIAL_DICTATION_STATE } from '@/features/speech/dictationState';
import { SpeechRecognitionFailure } from '@/features/speech/SpeechServices';
import { useSpeechServices } from '@/features/speech/useSpeechServices';
import { Button, IconButton, Spinner } from '@/shared/ui';

export type DictationInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type'
> & {
  describedBy?: string;
  label: string;
  language: string;
  onValueChange: (value: string) => void;
  resetKey: string;
  validationState?: 'correct' | 'incorrect';
  value: string;
};

function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Editable answer input enhanced with optional, non-submitting browser dictation. */
export const DictationInput = forwardRef<HTMLInputElement, DictationInputProps>(
  function DictationInput(
    {
      describedBy,
      disabled = false,
      id,
      label,
      language,
      onValueChange,
      readOnly = false,
      resetKey,
      validationState,
      value,
      ...inputProps
    },
    ref,
  ): ReactElement {
    const { t } = useTranslation('quiz');
    const { recognizer, synthesizer } = useSpeechServices();
    const [state, dispatch] = useReducer(dictationReducer, INITIAL_DICTATION_STATE);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const inputElementRef = useRef<HTMLInputElement | null>(null);
    const operationIdRef = useRef(0);
    const statusId = `${id}-dictation-status`;
    const isBusy =
      state.status === 'permission' ||
      state.status === 'listening' ||
      state.status === 'transcribing';
    const canDictate = recognizer.isSupported() && !disabled && !readOnly;

    useEffect(() => {
      operationIdRef.current += 1;
      recognizer.cancel();
      dispatch({ type: 'reset' });
      setElapsedSeconds(0);
    }, [recognizer, resetKey]);

    useEffect(() => {
      if (!readOnly && !disabled) {
        return;
      }

      operationIdRef.current += 1;
      recognizer.cancel();
      dispatch({ type: 'reset' });
    }, [disabled, readOnly, recognizer]);

    useEffect(() => {
      if (state.status !== 'listening') {
        return;
      }

      const interval = window.setInterval(() => {
        setElapsedSeconds((current) => current + 1);
      }, 1000);

      return () => {
        window.clearInterval(interval);
      };
    }, [state.status]);

    useEffect(
      () => () => {
        operationIdRef.current += 1;
        recognizer.cancel();
      },
      [recognizer],
    );

    useEffect(() => {
      if (state.status === 'ready') {
        inputElementRef.current?.focus();
      }
    }, [state.status]);

    const beginDictation = (): void => {
      if (!canDictate || isBusy) {
        return;
      }

      synthesizer.stop();
      setElapsedSeconds(0);
      dispatch({ type: 'permission' });
      const operationId = operationIdRef.current + 1;
      operationIdRef.current = operationId;
      void recognizer
        .start({
          language,
          maxAlternatives: 3,
          onListening: () => {
            dispatch({ type: 'listening' });
          },
        })
        .then((transcript) => {
          if (operationId !== operationIdRef.current) {
            return;
          }

          onValueChange(transcript);
          dispatch({ type: 'ready' });
        })
        .catch((error: unknown) => {
          if (operationId !== operationIdRef.current) {
            return;
          }

          if (error instanceof SpeechRecognitionFailure) {
            dispatch(
              error.code === 'cancelled'
                ? { type: 'cancelled' }
                : { code: error.code, type: 'failed' },
            );
          } else {
            dispatch({ code: 'network-error', type: 'failed' });
          }
        });
    };

    const cancelDictation = (): void => {
      recognizer.cancel();
      dispatch({ type: 'cancelled' });
    };

    const stopDictation = (): void => {
      dispatch({ type: 'transcribing' });
      recognizer.stop();
    };

    const errorCode = state.status === 'error' ? state.code : null;
    const stateDescribedBy = state.status === 'idle' ? undefined : statusId;
    const ariaDescribedBy = [describedBy, stateDescribedBy].filter(Boolean).join(' ') || undefined;

    return (
      <div>
        {isBusy ? (
          <p className="text-ink mb-2 text-sm font-black">{label}</p>
        ) : (
          <label className="text-ink mb-2 block text-sm font-black" htmlFor={id}>
            {label}
          </label>
        )}

        {state.status === 'listening' || state.status === 'transcribing' ? (
          <div
            aria-live="polite"
            className={`border-line-strong bg-surface-strong rounded-control flex min-h-14 items-center gap-3 border px-3 shadow-sm ${styles.statePanel}`}
            id={statusId}
            role="status"
          >
            {state.status === 'listening' ? (
              <>
                <span
                  aria-hidden="true"
                  className={`bg-danger size-2.5 rounded-full ${styles.listeningDot}`}
                />
                <span className="text-ink min-w-10 text-sm font-bold">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
                <span aria-hidden="true" className={styles.wave}>
                  {Array.from({ length: 7 }, (_, index) => (
                    <span className={styles.wave__bar} key={index} />
                  ))}
                </span>
                <span className="sr-only">{t('speech.listening')}</span>
                <Button className="ml-auto" onClick={cancelDictation} size="sm" variant="ghost">
                  <X aria-hidden="true" size={17} />
                  {t('speech.cancel')}
                </Button>
                <IconButton
                  aria-label={t('speech.stop')}
                  onClick={stopDictation}
                  size="sm"
                  variant="primary"
                >
                  <Square aria-hidden="true" size={15} />
                </IconButton>
              </>
            ) : (
              <>
                <Spinner size="sm" />
                <span className="text-ink text-sm font-bold">{t('speech.transcribing')}</span>
                <span className="text-muted ml-auto text-xs">{t('speech.transcribingHint')}</span>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              {...inputProps}
              aria-describedby={ariaDescribedBy}
              autoComplete="off"
              className={[
                'rounded-control bg-surface-strong text-ink placeholder:text-muted min-h-12 w-full border px-4 text-base shadow-sm transition-colors focus:outline-none',
                canDictate || validationState !== undefined ? 'pr-14' : '',
                inputProps.className ?? '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              id={id}
              onChange={(event) => {
                onValueChange(event.target.value);
                if (state.status !== 'idle') {
                  dispatch({ type: 'reset' });
                }
              }}
              readOnly={readOnly}
              ref={(element) => {
                inputElementRef.current = element;
                if (typeof ref === 'function') {
                  ref(element);
                } else if (ref !== null) {
                  ref.current = element;
                }
              }}
              type="text"
              value={value}
            />
            {canDictate ? (
              <IconButton
                aria-label={t(state.status === 'error' ? 'speech.retry' : 'speech.dictate')}
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={beginDictation}
                size="sm"
                variant={state.status === 'error' ? 'secondary' : 'ghost'}
              >
                <Mic aria-hidden="true" size={19} />
              </IconButton>
            ) : null}
            {validationState !== undefined ? (
              <span
                aria-hidden="true"
                className={[
                  'absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white',
                  validationState === 'correct' ? 'bg-success' : 'bg-danger',
                ].join(' ')}
              >
                {validationState === 'correct' ? <Check size={17} /> : <X size={17} />}
              </span>
            ) : null}
          </div>
        )}

        {state.status === 'permission' ? (
          <p
            aria-live="polite"
            className={`text-muted mt-2 text-sm ${styles.statusMessage}`}
            id={statusId}
            role="status"
          >
            {t('speech.permission')}
          </p>
        ) : null}
        {state.status === 'listening' ? (
          <p className="text-muted mt-2 text-xs">{t('speech.listeningHelp')}</p>
        ) : null}
        {state.status === 'ready' ? (
          <p
            aria-live="polite"
            className={`text-success mt-2 text-sm font-bold ${styles.statusMessage}`}
            id={statusId}
          >
            {t('speech.ready')}
          </p>
        ) : null}
        {state.status === 'cancelled' ? (
          <p
            aria-live="polite"
            className={`text-muted mt-2 text-sm ${styles.statusMessage}`}
            id={statusId}
          >
            {t('speech.cancelled')}
          </p>
        ) : null}
        {errorCode !== null ? (
          <div
            className={`bg-danger-soft text-ink rounded-control mt-2 p-3 text-sm ${styles.statusMessage}`}
            id={statusId}
            role="alert"
          >
            <strong>{t(`speech.errors.${errorCode}`)}</strong>
            <p className="text-muted mt-1">{t('speech.keyboardAvailable')}</p>
          </div>
        ) : null}
      </div>
    );
  },
);
