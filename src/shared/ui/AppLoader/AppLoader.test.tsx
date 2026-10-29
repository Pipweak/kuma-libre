import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppLoader } from '@/shared/ui/AppLoader/AppLoader';

describe('AppLoader', () => {
  it('announces the loading state and keeps the brand image decorative', () => {
    render(<AppLoader label="Chargement de Kuma Libre" />);

    expect(screen.getByRole('status', { name: 'Chargement de Kuma Libre' })).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
