import type { ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function NotFoundPage(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <section className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6 py-12 text-center">
      <p className="text-action text-sm font-bold tracking-[0.18em] uppercase">404</p>
      <h1 className="text-ink text-3xl font-black tracking-tight">{t('notFound.title')}</h1>
      <p className="text-muted">{t('notFound.description')}</p>
      <Link
        className="rounded-control bg-action shadow-card hover:bg-action-hover focus-visible:ring-action mx-auto inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2 font-bold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        to="/"
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={2.5} />
        {t('notFound.backHome')}
      </Link>
    </section>
  );
}
