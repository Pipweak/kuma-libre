import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from '@/shared/ui/IconButton/IconButton';

describe('IconButton', () => {
  it('exposes its required accessible label and action', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Ouvrir le menu" onClick={handleClick}>
        <span aria-hidden="true">V</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Ouvrir le menu' });
    await user.click(button);

    expect(button.getAttribute('type')).toBe('button');
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
