import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router/dom';

import { createAuthRepository } from '@/app/config/createAuthRepository';
import { router } from '@/app/router/router';
import { AuthProvider } from '@/features/auth/AuthProvider';

const authRepository = createAuthRepository({
  isDevelopment: import.meta.env.DEV,
  previewFlag: import.meta.env.VITE_ENABLE_APP_PREVIEW,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
});

export function App(): ReactElement {
  return (
    <AuthProvider repository={authRepository}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
