import type { ReactElement } from 'react';

export type ProgressBarProps = {
  label: string;
  max: number;
  tone?: ProgressBarTone;
  value: number;
  valueLabel?: string;
};

export type ProgressBarTone = 'action' | 'ink' | 'success';

const TONE_STYLES: Record<ProgressBarTone, string> = {
  action: 'bg-action',
  ink: 'bg-ink',
  success: 'bg-success',
};

/** Accessible session progress with a clamped visual percentage. */
export function ProgressBar({
  label,
  max,
  tone = 'action',
  value,
  valueLabel,
}: ProgressBarProps): ReactElement {
  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span aria-hidden="true">{valueLabel ?? `${safeValue} / ${max}`}</span>
      </div>
      <progress className="sr-only" max={safeMax} value={safeValue}>
        {percentage}%
      </progress>
      <div aria-hidden="true" className="bg-canvas-accent h-2.5 overflow-hidden rounded-full">
        <div
          className={`${TONE_STYLES[tone]} h-full rounded-full transition-[width] duration-200`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
