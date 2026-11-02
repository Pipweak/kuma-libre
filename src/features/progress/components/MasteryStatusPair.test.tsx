import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { MasteryStatusPair } from '@/features/progress/components/MasteryStatusPair';
import { i18n } from '@/shared/i18n/i18n';

describe('MasteryStatusPair', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('makes both direction, score and status explicit', () => {
    render(
      <MasteryStatusPair
        progress={{
          comprehension: { correctCount: 2, incorrectCount: 0, score: 2 },
          production: { correctCount: 3, incorrectCount: 0, score: 3 },
        }}
      />,
    );

    expect(screen.getByLabelText('Comprendre : À revoir, score 2 sur 3')).toBeDefined();
    expect(screen.getByLabelText('Produire : Maîtrisé, score 3 sur 3')).toBeDefined();
  });

  it('shows unseen directions as non-mastered', () => {
    render(<MasteryStatusPair progress={undefined} />);

    expect(screen.getByLabelText('Comprendre : Non maîtrisé, score 0 sur 3')).toBeDefined();
    expect(screen.getByLabelText('Produire : Non maîtrisé, score 0 sur 3')).toBeDefined();
  });
});
