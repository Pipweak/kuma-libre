import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import corpus from '../../src/generated/corpus.json' with { type: 'json' };

const FIRST_ENTRY = corpus.entries.find((entry) => entry.lessonId === corpus.lessons[0]!.id)!;

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('removes non-essential public motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const animationDurationMs = await page
    .getByRole('heading', { level: 1 })
    .locator('..')
    .evaluate((element) => {
      const duration =
        window.getComputedStyle(element).animationDuration.split(',').at(0)?.trim() ?? '0s';
      const parsedDuration = Number.parseFloat(duration);

      return duration.endsWith('ms') ? parsedDuration : parsedDuration * 1000;
    });

  expect(animationDurationMs).toBeLessThanOrEqual(0.01);
});

test('removes drawer and confirmation motion when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/app');

  await page
    .getByRole('button', {
      name: /Ouvrir le menu du profil|Open profile menu|Abrir el menú del perfil/,
    })
    .click();
  const drawerDurationMs = await page.locator('#profile-navigation').evaluate((element) => {
    const duration = window.getComputedStyle(element).animationDuration;
    const parsedDuration = Number.parseFloat(duration);
    return duration.endsWith('ms') ? parsedDuration : parsedDuration * 1000;
  });
  expect(drawerDurationMs).toBeLessThanOrEqual(0.01);

  await page.goto('/app/account');
  await page.getByRole('button', { name: /Se déconnecter|Sign out|Cerrar sesión/ }).click();
  const confirmationDurationMs = await page
    .getByRole('dialog')
    .locator('> div')
    .evaluate((element) => {
      const duration = window.getComputedStyle(element).animationDuration;
      const parsedDuration = Number.parseFloat(duration);
      return duration.endsWith('ms') ? parsedDuration : parsedDuration * 1000;
    });
  expect(confirmationDurationMs).toBeLessThanOrEqual(0.01);
});

test('has no automatically detectable quiz-configuration violations', async ({ page }) => {
  await page.goto('/app/quiz/configure?lesson=lesson-01');

  await expect(
    page.getByText(/Configurer le quiz|Configure the quiz/, { exact: true }).first(),
  ).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('has no automatically detectable quiz-question or correction violations', async ({ page }) => {
  await page.goto('/app/quiz/configure?lesson=lesson-01');
  await page.getByText(/Dans l’ordre|In order|En orden/, { exact: true }).click();
  await page.getByRole('button', { name: /Commencer|Start|Empezar/ }).click();

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page
    .getByRole('textbox', { name: /Ta réponse|Your answer|Tu respuesta/ })
    .fill(FIRST_ENTRY.meanings.fr[0]!);
  await page.getByRole('button', { name: /Valider|Validate|Validar/ }).click();

  await expect(page.getByRole('heading', { name: /Bonne réponse|Correct answer/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('has no automatically detectable account violations', async ({ page }) => {
  await page.goto('/app/account');

  await expect(page.getByText(/Compte|Account|Cuenta/).first()).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('has no automatically detectable progress or profile-menu violations', async ({ page }) => {
  await page.goto('/app/progress');

  await expect(page.getByText(/Progression|Progress|Progreso/).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page
    .getByRole('button', {
      name: /Ouvrir le menu du profil|Open profile menu|Abrir el menú del perfil/,
    })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
