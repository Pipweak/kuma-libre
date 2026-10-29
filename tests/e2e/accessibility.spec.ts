import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

test('has no automatically detectable quiz-configuration violations', async ({ page }) => {
  await page.goto('/app/quiz/configure?lesson=lesson-01');

  await expect(
    page.getByRole('heading', { name: /Configurer le quiz|Configure the quiz/ }),
  ).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('has no automatically detectable account violations', async ({ page }) => {
  await page.goto('/app/account');

  await expect(page.getByRole('heading', { name: /Compte|Account|Cuenta/ })).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('has no automatically detectable progress or profile-menu violations', async ({ page }) => {
  await page.goto('/app/progress');

  await expect(
    page.getByRole('heading', { name: /Ta progression|Your progress|Tu progreso/ }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page
    .getByRole('button', {
      name: /Ouvrir le menu du profil|Open profile menu|Abrir el menú del perfil/,
    })
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
