import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { ProgressRepository, ReviewSubmission } from '@/domain/progress';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProgressProvider } from '@/features/progress/ProgressProvider';
import { useProgress } from '@/features/progress/useProgress';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { InMemoryProgressRepository } from '@/infrastructure/progress/InMemoryProgressRepository';

const REVIEW: ReviewSubmission = {
  direction: 'comprehension',
  entryId: 'lesson-01-vocabulary-001',
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  normalizedAnswer: 'je',
  promptSnapshot: { kana: ['わたし'], kanji: ['私'], kind: 'japanese' },
  result: 'correct',
  submittedAnswer: 'je',
};

function Consumer(): ReactElement {
  const { errorCode, progress, recordReview, reload, status } = useProgress();
  const score = progress[REVIEW.entryId]?.comprehension?.score ?? 0;

  return (
    <div>
      <p>{status}</p>
      <p>{errorCode ?? 'no-error'}</p>
      <p>score:{score}</p>
      <button onClick={() => void recordReview(REVIEW)}>record</button>
      <button onClick={() => void reload()}>reload</button>
    </div>
  );
}

function renderProvider(repository: ProgressRepository): void {
  render(
    <AuthProvider repository={new PreviewAuthRepository()}>
      <ProgressProvider repository={repository}>
        <Consumer />
      </ProgressProvider>
    </AuthProvider>,
  );
}

describe('ProgressProvider', () => {
  it('loads and records authenticated progress', async () => {
    const user = userEvent.setup();
    renderProvider(new InMemoryProgressRepository());

    expect(await screen.findByText('ready')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'record' }));

    expect(await screen.findByText('score:1')).toBeDefined();
  });

  it('classifies loading failures and can retry', async () => {
    const repository: ProgressRepository = {
      getHistory: vi.fn(),
      getProgress: vi
        .fn()
        .mockRejectedValueOnce(new Error('provider details'))
        .mockResolvedValueOnce({}),
      recordReview: vi.fn(),
    };
    const user = userEvent.setup();
    renderProvider(repository);

    expect(await screen.findByText('load-failed')).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'reload' }));

    expect(await screen.findByText('ready')).toBeDefined();
  });
});
