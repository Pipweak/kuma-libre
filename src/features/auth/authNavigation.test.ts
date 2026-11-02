import { describe, expect, it } from 'vitest';

import {
  createAuthCallbackUrl,
  createLoginPath,
  resolveSafeReturnTo,
} from '@/features/auth/authNavigation';

describe('auth navigation', () => {
  it('preserves internal application destinations including search and hash', () => {
    expect(resolveSafeReturnTo('/app/lessons/06?from=home#words')).toBe(
      '/app/lessons/06?from=home#words',
    );
    expect(createLoginPath('/app/lessons/06')).toBe('/auth?returnTo=%2Fapp%2Flessons%2F06');
  });

  it.each([null, '', '/', '/auth', 'https://attacker.example/app', '//attacker.example/app'])(
    'rejects unsafe destination %s',
    (destination) => {
      expect(resolveSafeReturnTo(destination)).toBe('/app');
    },
  );

  it('builds a callback URL with a validated destination', () => {
    expect(createAuthCallbackUrl('https://kuma.example', '/app/quiz/configure')).toBe(
      'https://kuma.example/auth/callback?returnTo=%2Fapp%2Fquiz%2Fconfigure',
    );
  });
});
