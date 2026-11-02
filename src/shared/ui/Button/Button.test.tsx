import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/shared/ui/Button/Button';

describe('Button', () => {
  it('uses a safe default type and invokes its action', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Continuer</Button>);

    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button.getAttribute('type')).toBe('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('prevents interaction and announces a loading state', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button isLoading loadingLabel="Chargement" onClick={handleClick}>
        Continuer
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Chargement' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards its DOM reference', () => {
    const reference = createRef<HTMLButtonElement>();

    render(<Button ref={reference}>Continuer</Button>);

    expect(reference.current).toBe(screen.getByRole('button', { name: 'Continuer' }));
  });
});
