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
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);
