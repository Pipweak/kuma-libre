import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { ProfileMenu } from '@/features/navigation/components/ProfileMenu';
import { i18n } from '@/shared/i18n/i18n';

function renderMenu(): void {
  render(
    <MemoryRouter initialEntries={['/app/lessons']}>
      <ProfileMenu
        user={{ displayName: 'Vincent', email: 'vincent@example.com', id: 'preview-user' }}
      />
    </MemoryRouter>,
  );
}

describe('ProfileMenu', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('opens an accessible drawer and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Ouvrir le menu du profil' });

    await user.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('navigation', { name: 'Navigation de l’application' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Langue' }).getAttribute('href')).toBe(
      '/app/settings/language',
    );

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('traps keyboard focus inside the drawer', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du profil' }));
    const closeButtons = screen.getAllByRole('button', { name: 'Fermer le menu du profil' });
    const drawerCloseButton = closeButtons.at(-1)!;
    const accountLink = screen.getByRole('link', { name: 'Compte' });
    expect(document.activeElement).toBe(drawerCloseButton);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true }),
      );
    });
    expect(document.activeElement).toBe(accountLink);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
    });
    expect(document.activeElement).toBe(drawerCloseButton);
  });

  it('closes from the backdrop control', async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole('button', { name: 'Ouvrir le menu du profil' }));
    await user.click(screen.getAllByRole('button', { name: 'Fermer le menu du profil' })[0]!);

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
