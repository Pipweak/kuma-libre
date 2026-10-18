import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => {
  await initializeI18n();
});

afterEach(() => {
  cleanup();
});
