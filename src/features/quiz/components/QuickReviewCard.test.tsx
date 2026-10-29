import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import type { ProgressByEntry } from '@/domain/quiz';
import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';
import { QuickReviewCard } from '@/features/quiz/components/QuickReviewCard';
import { i18n } from '@/shared/i18n/i18n';

function renderCard(progress: ProgressByEntry = {}): ReturnType<typeof createMemoryRouter> {
  const value: ProgressContextValue = {
    errorCode: null,
    progress,
    recordReview: () => Promise.reject(new Error('not used')),
    reload: () => Promise.resolve(),
    status: 'ready',
  };
  const router = createMemoryRouter(
    [
      { path: '/', element: <QuickReviewCard /> },
      { path: '/app/quiz', element: <p>Quiz prêt</p> },
      { path: '/app/quiz/configure', element: <p>Configuration</p> },
    ],
    { initialEntries: ['/'] },
  );

  render(
    <ProgressContext.Provider value={value}>
      <RouterProvider router={router} />
    </ProgressContext.Provider>,
  );

  return router;
}

describe('QuickReviewCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('builds and starts the red-first comprehension preset', () => {
    const router = renderCard();

    expect(screen.getByText('10 mots prêts à réviser')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Commencer/ }));

    expect(router.state.location.pathname).toBe('/app/quiz');
    expect((router.state.location.state as { session: { total: number } }).session.total).toBe(10);
  });
});
