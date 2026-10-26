import { describe, expect, it } from 'vitest';

import { createAuthRepository } from '@/app/config/createAuthRepository';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';

describe('createAuthRepository', () => {
  it('uses preview authentication only in development or an explicit preview build', () => {
    expect(
      createAuthRepository({
        isDevelopment: true,
        previewFlag: undefined,
        publishableKey: undefined,
        supabaseUrl: undefined,
      }),
    ).toBeInstanceOf(PreviewAuthRepository);
    expect(
      createAuthRepository({
        isDevelopment: false,
        previewFlag: 'true',
        publishableKey: undefined,
        supabaseUrl: undefined,
      }),
    ).toBeInstanceOf(PreviewAuthRepository);
  });

  it('keeps a production build anonymous when configuration is missing', () => {
    expect(
      createAuthRepository({
        isDevelopment: false,
        previewFlag: undefined,
        publishableKey: undefined,
        supabaseUrl: undefined,
      }),
    ).toBeInstanceOf(UnavailableAuthRepository);
  });

  it('creates the Supabase adapter from public configuration', () => {
    expect(
      createAuthRepository({
        isDevelopment: false,
        previewFlag: undefined,
        publishableKey: 'sb_publishable_public-key',
        supabaseUrl: 'https://example.supabase.co',
      }),
    ).toBeInstanceOf(SupabaseAuthRepository);
  });

  it('uses real Supabase configuration during local development when it is available', () => {
    expect(
      createAuthRepository({
        isDevelopment: true,
        previewFlag: undefined,
        publishableKey: 'sb_publishable_public-key',
        supabaseUrl: 'https://example.supabase.co',
      }),
    ).toBeInstanceOf(SupabaseAuthRepository);
  });
});
