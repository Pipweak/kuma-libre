import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('shows the loading shell before React can start', async ({ page }) => {
  let releaseEntryScript: (() => void) | undefined;
  const entryScriptGate = new Promise<void>((resolve) => {
    releaseEntryScript = resolve;
  });

  await page.route(/\/(?:src\/main\.tsx|assets\/index-[^/]+\.js)(?:\?.*)?$/, async (route) => {
    await entryScriptGate;
    await route.continue();
  });

  const navigation = page.goto('/');

  try {
    const initialLoader = page.locator('[data-initial-loader]');
    await expect(initialLoader).toBeVisible();
    await expect(initialLoader.getByText('Chargement de Kuma Libre')).toBeVisible();
    await expect(initialLoader.getByText('Loading Kuma Libre')).toBeHidden();
    await expect(initialLoader.getByText('Cargando Kuma Libre')).toBeHidden();
    expect(
      (await new AxeBuilder({ page }).include('[data-initial-loader]').analyze()).violations,
    ).toEqual([]);
  } finally {
    releaseEntryScript?.();
    await navigation;
  }

  await expect(page.locator('[data-initial-loader]')).toHaveCount(0);
});

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
  await page.goto('/app');

  await expect(
    page.getByRole('heading', { level: 1, name: /Qu’est-ce qu’on révise|What shall we review/ }),
  ).toBeVisible();

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
  await page.goto('/app');

  await page.getByRole('button', { name: /Ouvrir le menu du profil|Open profile menu/ }).click();
  await page.getByRole('link', { name: /Progression|Progress/ }).click();

  await expect(page).toHaveURL(/\/app\/progress$/);
  await expect(page.getByText(/Progression|Progress|Progreso/).first()).toBeVisible();
  await expect(page.getByText(/18 leçons|18 lessons/)).toBeVisible();
});
