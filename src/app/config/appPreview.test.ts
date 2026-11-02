import { describe, expect, it } from 'vitest';

import { isAppPreviewEnabled } from '@/app/config/appPreview';

describe('isAppPreviewEnabled', () => {
  it('allows development and explicit test builds', () => {
    expect(isAppPreviewEnabled(true, undefined)).toBe(true);
    expect(isAppPreviewEnabled(false, 'true')).toBe(true);
  });

  it('keeps ordinary production builds closed before authentication exists', () => {
    expect(isAppPreviewEnabled(false, undefined)).toBe(false);
    expect(isAppPreviewEnabled(false, 'false')).toBe(false);
  });
});
