import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Card } from '@/shared/ui/Card/Card';

describe('Card', () => {
  it('forwards its DOM reference', () => {
    const reference = createRef<HTMLDivElement>();

    render(
      <Card ref={reference} role="region">
        Contenu
      </Card>,
    );

    expect(reference.current).toBe(screen.getByRole('region'));
  });
});
