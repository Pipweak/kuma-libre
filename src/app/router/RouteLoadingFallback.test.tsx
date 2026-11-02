import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { RouteLoadingFallback } from '@/app/router/RouteLoadingFallback';
import { i18n } from '@/shared/i18n/i18n';

describe('RouteLoadingFallback', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('announces route loading without exposing decorative animation', () => {
    render(<RouteLoadingFallback />);

    expect(screen.getByRole('status', { name: 'Chargement de Kuma Libre' })).toBeDefined();
  });
});
