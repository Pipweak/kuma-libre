import { describe, expect, it } from 'vitest';

import { getAuthErrorCode, getUserInitial } from '@/features/auth/authPresentation';
import { AuthRepositoryError } from '@/features/auth/authTypes';

describe('auth presentation', () => {
  it('uses a display name, then email, to derive the profile initial', () => {
    expect(getUserInitial(' Vincent ', 'fallback@example.com')).toBe('V');
    expect(getUserInitial(undefined, 'akira@example.com')).toBe('A');
    expect(getUserInitial(undefined, '')).toBe('?');
  });

  it('keeps classified repository errors and masks unknown errors', () => {
    expect(getAuthErrorCode(new AuthRepositoryError('configuration'))).toBe('configuration');
    expect(getAuthErrorCode(new Error('internal provider details'))).toBe('provider-error');
  });
});
