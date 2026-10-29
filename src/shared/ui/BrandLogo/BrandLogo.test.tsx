import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrandLogo, type BrandLogoVariant } from '@/shared/ui/BrandLogo/BrandLogo';

describe('BrandLogo', () => {
  it.each([
    ['bear', 1254, 1254, 'kuma-bear-wink'],
    ['horizontal', 1536, 1024, 'kuma-logo-horizontal'],
    ['stacked', 1122, 1402, 'kuma-logo-stacked'],
    ['wordmark', 1610, 328, 'kuma-wordmark-v2'],
  ] satisfies ReadonlyArray<readonly [BrandLogoVariant, number, number, string]>)(
    'preserves the intrinsic ratio of the %s asset',
    (variant, expectedWidth, expectedHeight, sourceFragment) => {
      render(<BrandLogo priority variant={variant} />);

      const image = screen.getByRole('img', { name: 'Kuma Libre' });

      expect(image.getAttribute('width')).toBe(String(expectedWidth));
      expect(image.getAttribute('height')).toBe(String(expectedHeight));
      expect(image.getAttribute('loading')).toBe('eager');
      expect(image.getAttribute('src')).toContain(sourceFragment);
    },
  );

  it('can be decorative and lazy-loaded', () => {
    const { container } = render(<BrandLogo alt="" />);
    const image = container.querySelector('img');

    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('src')).toContain('kuma-wordmark-v2');
  });
});
