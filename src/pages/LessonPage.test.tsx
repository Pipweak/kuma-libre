import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { getPrimaryJapaneseForm } from '@/features/lessons/lessonPresentation';
import { LessonPage } from '@/pages/LessonPage';
import { i18n } from '@/shared/i18n/i18n';

describe('LessonPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the real entries and categories for the selected lesson', () => {
    const lesson = vocabularyCorpus.lessons[0]!;
    const firstEntry = vocabularyCorpus.entries.find((entry) => entry.lessonId === lesson.id)!;
    const router = createMemoryRouter([{ path: '/app/lessons/:lessonId', Component: LessonPage }], {
      initialEntries: [`/app/lessons/${lesson.id}`],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Leçon 01' })).toBeDefined();
    expect(screen.getByText(getPrimaryJapaneseForm(firstEntry))).toBeDefined();
    expect(screen.getByRole('link', { name: 'Réviser cette leçon' }).getAttribute('href')).toBe(
      `/app/quiz/configure?lesson=${lesson.id}`,
    );
  });

  it('handles an unknown lesson without inventing content', () => {
    const router = createMemoryRouter([{ path: '/app/lessons/:lessonId', Component: LessonPage }], {
      initialEntries: ['/app/lessons/unknown'],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: 'Leçon introuvable' })).toBeDefined();
  });
});
