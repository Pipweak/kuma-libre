import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlagIcon } from './FlagIcon';

describe('FlagIcon', () => {
  it('is decorative without a label', () => {
    const { container } = render(<FlagIcon code="ja" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it.each(['fr', 'en', 'es'] as const)('renders an accessible %s flag', (code) => {
    render(<FlagIcon code={code} label={`flag-${code}`} />);
    expect(screen.getByRole('img', { name: `flag-${code}` })).toBeDefined();
  });
});
