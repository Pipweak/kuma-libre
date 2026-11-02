import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { LanguagePage } from '@/pages/LanguagePage';
import { i18n } from '@/shared/i18n/i18n';

describe('LanguagePage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('changes every interface label through the shared language selector', async () => {
    const user = userEvent.setup();
    render(<LanguagePage />);

    expect(screen.getByRole('heading', { name: 'Langue' })).toBeDefined();
    await user.click(screen.getByRole('button', { name: /Español/ }));
    expect(screen.getByRole('heading', { name: 'Idioma' })).toBeDefined();
  });
});
