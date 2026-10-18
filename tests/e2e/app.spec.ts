import { expect, test } from '@playwright/test';

test('loads the public foundation and switches language', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Kuma Libre' })).toBeVisible();

  await page.getByRole('button', { name: 'Español' }).click();

  await expect(
    page.getByRole('heading', { level: 2, name: 'Base técnica preparada' }),
  ).toBeVisible();
});
