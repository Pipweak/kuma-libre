import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getMasteryLevel,
  type EntryProgress,
  type MasteryLevel,
  type QuizDirection,
} from '@/domain/quiz';

export type MasteryStatusPairProps = {
  progress: EntryProgress | undefined;
};

const LEVEL_STYLES: Record<MasteryLevel, string> = {
  green: 'border-success bg-success-soft text-ink',
  red: 'border-danger bg-danger-soft text-ink',
  yellow: 'border-warning bg-warning-soft text-ink',
};

const DIRECTION_LABELS: Record<QuizDirection, string> = {
  comprehension: 'comprehension',
  production: 'production',
};

const DIRECTION_MARKS: Record<QuizDirection, string> = {
  comprehension: 'C',
  production: 'P',
};

export function MasteryStatusPair({ progress }: MasteryStatusPairProps): ReactElement {
  const { t } = useTranslation('progress');

  return (
    <div className="flex shrink-0 gap-1.5">
      {(['comprehension', 'production'] as const).map((direction) => {
        const score = progress?.[direction]?.score ?? 0;
        const level = getMasteryLevel(score);
        const directionLabel = t(DIRECTION_LABELS[direction]);
        const levelLabel = t(`mastery.${level}`);

        return (
          <span
            aria-label={t('entryStatus', {
              direction: directionLabel,
              score,
              status: levelLabel,
            })}
            className={`${LEVEL_STYLES[level]} rounded-pill inline-flex min-h-8 items-center gap-1 border px-2 text-xs font-black`}
            key={direction}
            title={`${directionLabel} · ${levelLabel}`}
          >
            <span aria-hidden="true">{DIRECTION_MARKS[direction]}</span>
            <span aria-hidden="true" className="font-semibold">
              {score}/3
            </span>
          </span>
        );
      })}
    </div>
  );
}
