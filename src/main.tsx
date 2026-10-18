import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { initializeI18n } from '@/shared/i18n/i18n';
import '@/shared/styles/global.css';

async function bootstrap(): Promise<void> {
  await initializeI18n();

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Unable to mount Kuma Libre: the root element is missing.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
