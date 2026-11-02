import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import type { ProgressByEntry } from '@/domain/quiz';
import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';
import { HomePage } from '@/pages/HomePage';
import { i18n } from '@/shared/i18n/i18n';

function renderPage(progress: ProgressByEntry = {}): void {
  const value: ProgressContextValue = {
    errorCode: null,
    progress,
    recordReview: () => Promise.reject(new Error('not used')),
    reload: () => Promise.resolve(),
    status: 'ready',
  };

  render(
    <ProgressContext.Provider value={value}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </ProgressContext.Provider>,
  );
}

describe('HomePage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('offers quick review and only the first three real lessons', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Qu’est-ce qu’on révise ?' }),
    ).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Voir tout' }).getAttribute('href')).toBe(
      '/app/lessons',
    );
    expect(screen.queryByText('Fondations')).toBeNull();
  });
});
