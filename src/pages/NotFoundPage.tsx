import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function NotFoundPage(): ReactElement {
  const { t } = useTranslation('common');

  return (
    <section className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6 py-12 text-center">
      <p className="text-sm font-bold tracking-[0.18em] text-red-700 uppercase">404</p>
      <h1 className="text-3xl font-black tracking-tight text-stone-950">{t('notFound.title')}</h1>
      <p className="text-stone-600">{t('notFound.description')}</p>
      <Link
        className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        to="/"
      >
        {t('notFound.backHome')}
      </Link>
    </section>
  );
}
