import { Square, Volume2 } from 'lucide-react';
import { type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuizQuestion } from '@/domain/quiz';
import { getQuestionSpeechRequest } from '@/features/speech/speechPresentation';
import { useSpeechServices } from '@/features/speech/useSpeechServices';
import { Button } from '@/shared/ui';

export type QuestionAudioButtonProps = {
  question: QuizQuestion;
};

/** Reads the current prompt through the browser voice selected by the speech adapter. */
export function QuestionAudioButton({ question }: QuestionAudioButtonProps): ReactElement | null {
  const { t } = useTranslation('quiz');
  const { synthesizer } = useSpeechServices();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const request = getQuestionSpeechRequest(question);

  useEffect(
    () => () => {
      synthesizer.stop();
    },
    [synthesizer],
  );

  if (!synthesizer.isSupported() || request === null) {
    return null;
  }

  const handleClick = (): void => {
    if (isSpeaking) {
      synthesizer.stop();
      setIsSpeaking(false);
      return;
    }

    setHasFailed(false);
    setIsSpeaking(true);
    void synthesizer
      .speak(request.text, { language: request.language })
      .catch(() => {
        setHasFailed(true);
      })
      .finally(() => {
        setIsSpeaking(false);
      });
  };

  return (
    <div className="mt-2 flex flex-col items-center gap-1">
      <Button aria-pressed={isSpeaking} onClick={handleClick} size="sm" variant="secondary">
        {isSpeaking ? (
          <Square aria-hidden="true" size={16} />
        ) : (
          <Volume2 aria-hidden="true" size={18} />
        )}
        {t(isSpeaking ? 'speech.stopPlayback' : 'speech.listen')}
      </Button>
      {hasFailed ? (
        <span className="text-danger text-xs" role="alert">
          {t('speech.playbackError')}
        </span>
      ) : null}
    </div>
  );
}
