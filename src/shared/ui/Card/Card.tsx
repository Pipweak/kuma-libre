import type { HTMLAttributes, ReactElement } from 'react';

export type CardTone = 'surface' | 'soft';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const TONE_STYLES: Record<CardTone, string> = {
  soft: 'bg-canvas-accent',
  surface: 'border border-line bg-surface shadow-card',
};

export function Card({ className, tone = 'surface', ...cardProps }: CardProps): ReactElement {
  return (
    <div
      {...cardProps}
      className={['rounded-card', TONE_STYLES[tone], className].filter(Boolean).join(' ')}
    />
  );
}
