import { createBrowserRouter } from 'react-router';

import { RootLayout } from '@/app/layouts/RootLayout';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);
