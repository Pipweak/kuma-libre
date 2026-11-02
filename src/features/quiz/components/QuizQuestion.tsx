import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { QuizQuestion as QuizQuestionContract } from '@/domain/quiz';
import { FlagIcon } from '@/shared/ui';

export type QuizQuestionProps = {
  audioControl?: ReactNode;
  question: QuizQuestionContract;
};

export function QuizQuestion({ audioControl, question }: QuizQuestionProps): ReactElement {
  const { t } = useTranslation('quiz');

  if (question.prompt.kind === 'meaning') {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-center sm:min-h-52">
        {audioControl}
        <span className="bg-canvas-accent text-muted rounded-pill inline-flex items-center gap-2 px-3 py-1 text-sm font-bold">
          <FlagIcon code={question.prompt.locale} />
          {t(`languages.${question.prompt.locale}`)}
        </span>
        <strong className="text-ink text-3xl font-black sm:text-5xl">{question.prompt.text}</strong>
        <span className="text-muted text-sm">{t('question.productionHint')}</span>
      </div>
    );
  }

  const primaryForm = question.prompt.kanji[0] ?? question.prompt.kana[0] ?? '';
  const reading = question.prompt.kanji.length > 0 ? question.prompt.kana.join(' · ') : '';

  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center sm:min-h-52">
      {audioControl}
      <strong className="font-japanese text-ink text-4xl font-black sm:text-6xl" lang="ja">
        {primaryForm}
      </strong>
      {reading ? (
        <span className="font-japanese text-muted text-lg sm:text-xl" lang="ja">
          {reading}
        </span>
      ) : null}
      <span className="text-muted mt-2 text-sm">{t('question.comprehensionHint')}</span>
    </div>
  );
}
