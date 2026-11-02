import type { ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useAuth } from '@/features/auth/useAuth';

export function NotFoundPage(): ReactElement {
  const { t } = useTranslation('common');
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';

  return (
    <section className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="text-action-soft text-8xl font-black select-none sm:text-9xl"
      >
        迷
      </span>
      <p className="text-action text-sm font-bold tracking-[0.18em] uppercase">
        {t('notFound.eyebrow')}
      </p>
      <h1 className="text-ink text-3xl font-black tracking-tight">{t('notFound.title')}</h1>
      <p className="text-muted">{t('notFound.description')}</p>
      <Link
        className="rounded-control bg-action shadow-card hover:bg-action-hover focus-visible:ring-action mx-auto inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2 font-bold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        to={isAuthenticated ? '/app' : '/'}
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.5} />
        {t(isAuthenticated ? 'notFound.backApp' : 'notFound.backHome')}
      </Link>
    </section>
  );
}
