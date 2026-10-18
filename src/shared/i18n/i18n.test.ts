import { describe, expect, it } from 'vitest';

import { i18n, initializeI18n, resolveSupportedLocale } from '@/shared/i18n/i18n';

describe('resolveSupportedLocale', () => {
  it.each([
    ['fr-CA', 'fr'],
    ['EN-us', 'en'],
    ['es-MX', 'es'],
  ] as const)('maps %s to %s', (browserLocale, expectedLocale) => {
    expect(resolveSupportedLocale(browserLocale)).toBe(expectedLocale);
  });

  it.each([undefined, '', 'de-DE'])('falls back to French for %s', (browserLocale) => {
    expect(resolveSupportedLocale(browserLocale)).toBe('fr');
  });

  it('keeps the initialized shared instance stable', async () => {
    await initializeI18n();

    expect(i18n.isInitialized).toBe(true);
  });
});
