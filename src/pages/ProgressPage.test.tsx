import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import type { ProgressByEntry } from '@/domain/quiz';
import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';
import { ProgressPage } from '@/pages/ProgressPage';
import { i18n } from '@/shared/i18n/i18n';

function renderPage(progress: ProgressByEntry): void {
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
        <ProgressPage />
      </MemoryRouter>
    </ProgressContext.Provider>,
  );
}

describe('ProgressPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows real global and per-lesson mastery', () => {
    const firstEntry = vocabularyCorpus.entries[0]!;
    renderPage({
      [firstEntry.id]: {
        comprehension: { correctCount: 3, incorrectCount: 0, score: 3 },
        production: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Ta progression' })).toBeDefined();
    expect(screen.getByText('1 mot maîtrisé dans les deux sens')).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(vocabularyCorpus.lessons.length);
    expect(screen.getByRole('link', { name: /Leçon 01/ })).toBeDefined();
  });
});
