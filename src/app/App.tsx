import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router/dom';

import { createApplicationRepositories } from '@/app/config/createApplicationRepositories';
import { router } from '@/app/router/router';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProgressProvider } from '@/features/progress/ProgressProvider';
import { SpeechProvider } from '@/features/speech/SpeechProvider';
import { WebSpeechRecognizer } from '@/infrastructure/speech/WebSpeechRecognizer';
import { WebSpeechSynthesizer } from '@/infrastructure/speech/WebSpeechSynthesizer';

const repositories = createApplicationRepositories({
  isDevelopment: import.meta.env.DEV,
  previewFlag: import.meta.env.VITE_ENABLE_APP_PREVIEW,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
});

const speechServices = {
  recognizer: new WebSpeechRecognizer(),
  synthesizer: new WebSpeechSynthesizer(),
};

export function App(): ReactElement {
  return (
    <AuthProvider repository={repositories.auth}>
      <ProgressProvider repository={repositories.progress}>
        <SpeechProvider services={speechServices}>
          <RouterProvider router={router} />
        </SpeechProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
