import type { ImgHTMLAttributes, ReactElement } from 'react';

import stackedSource from '@/assets/brand/kuma-logo-stacked.png';
import wordmarkV2Source from '@/assets/brand/kuma-wordmark-v2.png';

const BRAND_ASSETS = {
  stacked: { height: 1402, source: stackedSource, width: 1122 },
  wordmark: { height: 328, source: wordmarkV2Source, width: 1610 },
} as const;

export type BrandLogoVariant = keyof typeof BRAND_ASSETS;

export type BrandLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'height' | 'loading' | 'src' | 'width'
> & {
  alt?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
};

/** Renders a transparent Kuma Libre brand asset without cropping its intrinsic proportions. */
export function BrandLogo({
  alt = 'Kuma Libre',
  className,
  priority = false,
  variant = 'wordmark',
  ...imageProps
}: BrandLogoProps): ReactElement {
  const asset = BRAND_ASSETS[variant];

  return (
    <img
      {...imageProps}
      alt={alt}
      className={['block h-auto max-w-full object-contain', className].filter(Boolean).join(' ')}
      decoding="async"
      draggable={false}
      fetchPriority={priority ? 'high' : 'auto'}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      src={asset.source}
      width={asset.width}
    />
  );
}
