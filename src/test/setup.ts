import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

import { initializeI18n } from '@/shared/i18n/i18n';

beforeAll(async () => {
  window.scrollTo = vi.fn();
  await initializeI18n();
});

afterEach(() => {
  cleanup();
});
