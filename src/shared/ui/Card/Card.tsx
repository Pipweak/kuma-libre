import { forwardRef, type HTMLAttributes, type ReactElement } from 'react';

export type CardTone = 'surface' | 'soft';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const TONE_STYLES: Record<CardTone, string> = {
  soft: 'bg-canvas-accent',
  surface: 'border border-line bg-surface shadow-card',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone = 'surface', ...cardProps },
  ref,
): ReactElement {
  return (
    <div
      {...cardProps}
      className={['rounded-card', TONE_STYLES[tone], className].filter(Boolean).join(' ')}
      ref={ref}
    />
  );
});
