import { createClient } from '@supabase/supabase-js';

import { isAppPreviewEnabled } from '@/app/config/appPreview';
import type { ProgressRepository } from '@/domain/progress';
import type { AuthRepository } from '@/features/auth/AuthRepository';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { InMemoryProgressRepository } from '@/infrastructure/progress/InMemoryProgressRepository';
import { UnavailableProgressRepository } from '@/infrastructure/progress/UnavailableProgressRepository';
import { SupabaseAuthRepository } from '@/infrastructure/supabase/SupabaseAuthRepository';
import { SupabaseProgressRepository } from '@/infrastructure/supabase/SupabaseProgressRepository';

export type BackendEnvironment = {
  isDevelopment: boolean;
  previewFlag: string | undefined;
  publishableKey: string | undefined;
  supabaseUrl: string | undefined;
};

export type ApplicationRepositories = {
  auth: AuthRepository;
  progress: ProgressRepository;
};

/** Creates one shared Supabase client or a coherent pair of preview/unavailable adapters. */
export function createApplicationRepositories(
  environment: BackendEnvironment,
): ApplicationRepositories {
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

    return {
      auth: new SupabaseAuthRepository(client.auth),
      progress: new SupabaseProgressRepository(client),
    };
  }

  if (isAppPreviewEnabled(environment.isDevelopment, environment.previewFlag)) {
    return {
      auth: new PreviewAuthRepository(),
      progress: new InMemoryProgressRepository(),
    };
  }

  return {
    auth: new UnavailableAuthRepository(),
    progress: new UnavailableProgressRepository(),
  };
}
