import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from '@/shared/ui/Spinner/Spinner';

describe('Spinner', () => {
  it('announces progress when a label is supplied', () => {
    render(<Spinner label="Chargement" size="lg" />);

    expect(screen.getByRole('status', { name: 'Chargement' })).toBeDefined();
  });

  it('remains decorative without a label', () => {
    render(<Spinner />);

    expect(screen.queryByRole('status')).toBeNull();
  });
});
