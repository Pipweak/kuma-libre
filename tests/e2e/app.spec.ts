import { expect, test } from '@playwright/test';

test('loads the public foundation and switches language', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Kuma Libre' })).toBeVisible();

  await page.getByRole('button', { name: 'Español' }).click();

  await expect(
    page.getByRole('heading', { level: 2, name: 'Base técnica preparada' }),
  ).toBeVisible();
});

test('opens the authenticated preview account and signs out', async ({ page }) => {
  await page.goto('/app/lessons');

  await page.getByRole('link', { name: /Ouvrir le compte|Open account/ }).click();
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(page.getByText('vincent@example.com')).toBeVisible();

  await page.getByRole('button', { name: /Se déconnecter|Sign out/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Se déconnecter|Sign out/ }).click();

  await expect(page).toHaveURL(/\/$/);
});
