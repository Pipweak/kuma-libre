import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProgressOverview } from '@/features/progress/components/ProgressOverview';
import { i18n } from '@/shared/i18n/i18n';

describe('ProgressOverview', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows overall and direction-specific mastery', () => {
    render(
      <ProgressOverview
        summary={{
          comprehension: { masteredCount: 3, percentage: 60, totalCount: 5 },
          overall: { masteredCount: 1, percentage: 20, totalCount: 5 },
          production: { masteredCount: 2, percentage: 40, totalCount: 5 },
        }}
      />,
    );

    expect(screen.getByText('1 mot maîtrisé dans les deux sens')).toBeDefined();
    expect(screen.getByRole('img', { name: /Maîtrise globale : 20/ })).toBeDefined();
    const progressBars = screen.getAllByRole<HTMLProgressElement>('progressbar');
    expect(progressBars).toHaveLength(2);
    expect(progressBars[0]?.value).toBe(60);
    expect(progressBars[1]?.value).toBe(40);
  });
});
