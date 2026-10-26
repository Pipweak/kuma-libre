import { createBrowserRouter, Navigate } from 'react-router';

import { AppLayout } from '@/app/layouts/AppLayout';
import { RootLayout } from '@/app/layouts/RootLayout';
import { RouteLoadingFallback } from '@/app/router/RouteLoadingFallback';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    hydrateFallbackElement: <RouteLoadingFallback />,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: 'auth',
        lazy: async () => {
          const { LoginPage } = await import('@/pages/LoginPage');
          return { Component: LoginPage };
        },
      },
      {
        path: 'auth/callback',
        lazy: async () => {
          const { AuthCallbackPage } = await import('@/pages/AuthCallbackPage');
          return { Component: AuthCallbackPage };
        },
      },
      {
        path: 'app',
        Component: AppLayout,
        children: [
          {
            index: true,
            element: <Navigate replace to="lessons" />,
          },
          {
            path: 'lessons',
            lazy: async () => {
              const { LessonsPage } = await import('@/pages/LessonsPage');
              return { Component: LessonsPage };
            },
          },
          {
            path: 'lessons/:lessonId',
            lazy: async () => {
              const { LessonPage } = await import('@/pages/LessonPage');
              return { Component: LessonPage };
            },
          },
          {
            path: 'quiz/configure',
            lazy: async () => {
              const { QuizConfigurationPage } = await import('@/pages/QuizConfigurationPage');
              return { Component: QuizConfigurationPage };
            },
          },
          {
            path: 'quiz',
            lazy: async () => {
              const { QuizPage } = await import('@/pages/QuizPage');
              return { Component: QuizPage };
            },
          },
          {
            path: 'quiz/result',
            lazy: async () => {
              const { QuizResultPage } = await import('@/pages/QuizResultPage');
              return { Component: QuizResultPage };
            },
          },
          {
            path: 'account',
            lazy: async () => {
              const { AccountPage } = await import('@/pages/AccountPage');
              return { Component: AccountPage };
            },
          },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);
