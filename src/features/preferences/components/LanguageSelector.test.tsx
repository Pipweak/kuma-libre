import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { LanguageSelector } from '@/features/preferences/components/LanguageSelector';
import { i18n } from '@/shared/i18n/i18n';

describe('LanguageSelector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('exposes the active language and changes the interface locale', async () => {
    const user = userEvent.setup();

    render(<LanguageSelector />);

    expect(screen.getByRole('button', { name: 'Français' }).getAttribute('aria-pressed')).toBe(
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Español' }));

    expect(i18n.resolvedLanguage).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('group', { name: 'Idioma de la interfaz' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Español' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
  });
});
