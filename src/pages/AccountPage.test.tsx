import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import type { AuthRepository } from '@/features/auth/AuthRepository';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AccountPage } from '@/pages/AccountPage';
import { i18n } from '@/shared/i18n/i18n';

function createRepository(): AuthRepository {
  return {
    completeSignIn: vi.fn(),
    getSession: vi.fn().mockResolvedValue({
      user: { displayName: 'Vincent', email: 'vincent@example.com', id: 'user-1' },
    }),
    onAuthStateChange: vi.fn().mockReturnValue(() => undefined),
    signInWithGoogle: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
}

describe('AccountPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the account and confirms before signing out', async () => {
    const user = userEvent.setup();
    const repository = createRepository();
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByText('vincent@example.com')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Se déconnecter' }));
    const dialog = screen.getByRole('dialog', { name: 'Se déconnecter ?' });
    expect(dialog).toBeDefined();
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Annuler' }));

    await user.click(within(dialog).getByRole('button', { name: 'Se déconnecter' }));
    expect(repository.signOut).toHaveBeenCalledOnce();
  });

  it('closes the confirmation with Escape and restores focus', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider repository={createRepository()}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    const signOutButton = await screen.findByRole('button', { name: 'Se déconnecter' });
    await user.click(signOutButton);
    expect(screen.getByRole('dialog', { name: 'Se déconnecter ?' })).toBeDefined();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(signOutButton);
  });

  it('keeps keyboard focus inside the confirmation', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider repository={createRepository()}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Se déconnecter' }));
    const dialog = screen.getByRole('dialog', { name: 'Se déconnecter ?' });
    const cancelButton = within(dialog).getByRole('button', { name: 'Annuler' });
    const confirmButton = within(dialog).getByRole('button', { name: 'Se déconnecter' });

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirmButton);

    await user.tab();
    expect(document.activeElement).toBe(cancelButton);

    fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cancelButton);
  });

  it('keeps the confirmation open while signing out', async () => {
    const user = userEvent.setup();
    const repository = createRepository();
    repository.signOut = vi.fn().mockReturnValue(new Promise(() => undefined));
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Se déconnecter' }));
    const dialog = screen.getByRole('dialog', { name: 'Se déconnecter ?' });
    await user.click(within(dialog).getByRole('button', { name: 'Se déconnecter' }));

    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(screen.getByRole('dialog', { name: 'Se déconnecter ?' })).toBeDefined();
  });

  it('shows a safe error when sign-out fails', async () => {
    const user = userEvent.setup();
    const repository = createRepository();
    repository.signOut = vi.fn().mockRejectedValue(new Error('provider details'));
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter>
          <AccountPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'Se déconnecter' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Se déconnecter' }),
    );

    expect((await screen.findByRole('alert')).textContent).toBe(
      'La connexion a échoué. Vérifie ta connexion internet puis réessaie.',
    );
  });
});
