import type { ReactElement } from 'react';

export type ProgressBarProps = {
  label: string;
  max: number;
  value: number;
};

/** Accessible session progress with a clamped visual percentage. */
export function ProgressBar({ label, max, value }: ProgressBarProps): ReactElement {
  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <span aria-hidden="true">
          {safeValue} / {max}
        </span>
      </div>
      <progress className="sr-only" max={safeMax} value={safeValue}>
        {percentage}%
      </progress>
      <div aria-hidden="true" className="bg-canvas-accent h-2.5 overflow-hidden rounded-full">
        <div
          className="bg-action h-full rounded-full transition-[width] duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
