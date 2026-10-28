import { expect, test } from '@playwright/test';

import corpus from '../../src/generated/corpus.json' with { type: 'json' };

const FIRST_LESSON = corpus.lessons[0]!;
const FIRST_ENTRY = corpus.entries.find((entry) => entry.lessonId === FIRST_LESSON.id)!;

test('reviews a real lesson vocabulary entry through the first correction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Français' }).click();
  await page.getByRole('link', { name: 'Continuer à réviser' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Ton parcours' })).toBeVisible();
  await page.getByRole('link', { name: /Leçon 01/ }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Leçon 01' })).toBeVisible();
  await page.getByRole('link', { name: 'Réviser cette leçon' }).click();

  await expect(page.getByRole('heading', { name: 'Configurer le quiz' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: '01' })).toBeChecked();
  await page.getByText('Dans l’ordre', { exact: true }).click();
  await page.getByRole('button', { name: 'Commencer' }).click();

  await expect(page.getByText(FIRST_ENTRY.kana[0] ?? FIRST_ENTRY.romaji[0]!)).toBeVisible();
  await page.getByRole('textbox', { name: 'Ta réponse' }).fill(FIRST_ENTRY.meanings.fr[0]!);
  await page.getByRole('button', { name: 'Valider' }).click();

  await expect(page.getByRole('heading', { name: 'Bonne réponse' })).toBeVisible();
  await expect(page.getByText('Significations')).toBeVisible();
  await page.getByRole('button', { name: 'Quitter le quiz' }).click();
  await page.getByRole('button', { name: 'Quitter la passe' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Ton parcours' })).toBeVisible();
  await page.getByRole('link', { name: /Leçon 01/ }).click();
  await expect(page.getByLabel('Comprendre : À revoir, score 1 sur 3')).toBeVisible();
  await page.getByRole('link', { name: 'Réviser cette leçon' }).click();
  await page.getByText('Non maîtrisés', { exact: true }).click();

  await expect(page.getByRole('checkbox', { name: /Non maîtrisés/ })).not.toBeChecked();
  await expect(page.getByText('1 question', { exact: true })).toBeVisible();
});
