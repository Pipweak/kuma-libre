import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('has no automatically detectable quiz-configuration violations', async ({ page }) => {
  await page.goto('/app/quiz/configure?lesson=lesson-01');

  await expect(
    page.getByRole('heading', { name: /Configurer le quiz|Configure the quiz/ }),
  ).toBeVisible();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
