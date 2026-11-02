import { describe, expect, it } from 'vitest';

import { createApplicationRepositories } from '@/app/config/createApplicationRepositories';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { InMemoryProgressRepository } from '@/infrastructure/progress/InMemoryProgressRepository';
import { UnavailableProgressRepository } from '@/infrastructure/progress/UnavailableProgressRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';
import { SupabaseProgressRepository } from '@/infrastructure/supabase/SupabaseProgressRepository';

describe('createApplicationRepositories', () => {
  it('creates a coherent preview pair in development', () => {
    const repositories = createApplicationRepositories({
      isDevelopment: true,
      previewFlag: undefined,
      publishableKey: undefined,
      supabaseUrl: undefined,
    });

    expect(repositories.auth).toBeInstanceOf(PreviewAuthRepository);
    expect(repositories.progress).toBeInstanceOf(InMemoryProgressRepository);
  });

  it('lets the explicit E2E preview override real configuration', () => {
    const repositories = createApplicationRepositories({
      isDevelopment: false,
      previewFlag: 'true',
      publishableKey: 'sb_publishable_public-key',
      supabaseUrl: 'https://preview-override.supabase.co',
    });

    expect(repositories.auth).toBeInstanceOf(PreviewAuthRepository);
    expect(repositories.progress).toBeInstanceOf(InMemoryProgressRepository);
  });

  it('keeps an unconfigured production build unavailable', () => {
    const repositories = createApplicationRepositories({
      isDevelopment: false,
      previewFlag: undefined,
      publishableKey: undefined,
      supabaseUrl: undefined,
    });

    expect(repositories.auth).toBeInstanceOf(UnavailableAuthRepository);
    expect(repositories.progress).toBeInstanceOf(UnavailableProgressRepository);
  });

  it('creates both Supabase adapters from one configured composition', () => {
    const repositories = createApplicationRepositories({
      isDevelopment: true,
      previewFlag: undefined,
      publishableKey: 'sb_publishable_public-key',
      supabaseUrl: 'https://configured-progress.supabase.co',
    });

    expect(repositories.auth).toBeInstanceOf(SupabaseAuthRepository);
    expect(repositories.progress).toBeInstanceOf(SupabaseProgressRepository);
  });
});
