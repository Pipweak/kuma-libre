import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes native progress semantics and clamps visual values', () => {
    const { container, rerender } = render(<ProgressBar label="Question" max={10} value={12} />);
    expect(screen.getByRole<HTMLProgressElement>('progressbar').value).toBe(10);
    expect((container.querySelector('[style]') as HTMLElement).style.width).toBe('100%');

    rerender(<ProgressBar label="Question" max={0} value={-2} />);
    expect(screen.getByRole<HTMLProgressElement>('progressbar').value).toBe(0);
    expect((container.querySelector('[style]') as HTMLElement).style.width).toBe('0%');
  });
});
