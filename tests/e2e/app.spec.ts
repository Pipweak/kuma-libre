import { expect, test } from '@playwright/test';

test('loads the public experience and switches language', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Révise un peu. Retiens vraiment.' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Español' }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Repasa un poco. Recuérdalo de verdad.' }),
  ).toBeVisible();
});

test('opens secondary navigation, account, and signs out', async ({ page }) => {
  await page.goto('/app/lessons');

  await page.getByRole('button', { name: /Ouvrir le menu du profil|Open profile menu/ }).click();
  await page.getByRole('link', { name: /Compte|Account/ }).click();
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(page.getByText('vincent@example.com')).toBeVisible();

  await page.getByRole('button', { name: /Se déconnecter|Sign out/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Se déconnecter|Sign out/ }).click();

  await expect(page).toHaveURL(/\/$/);
});

test('opens the real progress view from the profile menu', async ({ page }) => {
  await page.goto('/app/lessons');

  await page.getByRole('button', { name: /Ouvrir le menu du profil|Open profile menu/ }).click();
  await page.getByRole('link', { name: /Progression|Progress/ }).click();

  await expect(page).toHaveURL(/\/app\/progress$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Ta progression|Your progress/ }),
  ).toBeVisible();
  await expect(page.getByText(/18 leçons|18 lessons/)).toBeVisible();
});
