import { createClient } from '@supabase/supabase-js';

import { isAppPreviewEnabled } from '@/app/config/appPreview';
import type { AuthRepository } from '@/features/auth/AuthRepository';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';

export type AuthEnvironment = {
  isDevelopment: boolean;
  previewFlag: string | undefined;
  publishableKey: string | undefined;
  supabaseUrl: string | undefined;
};

/** Composes exactly one auth backend without leaking Supabase into the React feature layer. */
export function createAuthRepository(environment: AuthEnvironment): AuthRepository {
  const isExplicitPreview = isAppPreviewEnabled(false, environment.previewFlag);

  if (environment.supabaseUrl && environment.publishableKey && !isExplicitPreview) {
    const client = createClient(environment.supabaseUrl, environment.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        persistSession: true,
      },
    });

    return new SupabaseAuthRepository(client.auth);
  }

  if (isAppPreviewEnabled(environment.isDevelopment, environment.previewFlag)) {
    return new PreviewAuthRepository();
  }

  return new UnavailableAuthRepository();
}
