import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router/dom';

import { createApplicationRepositories } from '@/app/config/createApplicationRepositories';
import { router } from '@/app/router/router';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProgressProvider } from '@/features/progress/ProgressProvider';

const repositories = createApplicationRepositories({
  isDevelopment: import.meta.env.DEV,
  previewFlag: import.meta.env.VITE_ENABLE_APP_PREVIEW,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
});

export function App(): ReactElement {
  return (
    <AuthProvider repository={repositories.auth}>
      <ProgressProvider repository={repositories.progress}>
        <RouterProvider router={router} />
      </ProgressProvider>
    </AuthProvider>
  );
}
