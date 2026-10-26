import { describe, expect, it } from 'vitest';

import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';

describe('authentication fallback repositories', () => {
  it('provides a deterministic authenticated preview without external I/O', async () => {
    const repository = new PreviewAuthRepository();
    await expect(repository.getSession()).resolves.toMatchObject({
      user: { email: 'vincent@example.com', id: 'preview-user' },
    });
    await expect(repository.completeSignIn()).resolves.toMatchObject({
      user: { id: 'preview-user' },
    });
    await expect(repository.signInWithGoogle()).resolves.toBeUndefined();
    await expect(repository.signInWithMagicLink()).resolves.toBeUndefined();
    await expect(repository.signOut()).resolves.toBeUndefined();
    expect(repository.onAuthStateChange()()).toBeUndefined();
  });

  it('keeps an unconfigured production environment anonymous with classified failures', async () => {
    const repository = new UnavailableAuthRepository();

    await expect(repository.getSession()).resolves.toBeNull();
    await expect(repository.completeSignIn()).rejects.toMatchObject({ code: 'configuration' });
    await expect(repository.signInWithGoogle()).rejects.toMatchObject({ code: 'configuration' });
    await expect(repository.signInWithMagicLink()).rejects.toMatchObject({
      code: 'configuration',
    });
    await expect(repository.signOut()).resolves.toBeUndefined();
    expect(repository.onAuthStateChange()()).toBeUndefined();
  });
});
