import { BookOpenText, CircleUserRound, Repeat2, TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useAuth } from '@/features/auth/useAuth';
import { LanguageSelector } from '@/features/preferences/components/LanguageSelector';
import { AppLoader, BrandLogo, Card } from '@/shared/ui';

import styles from './LandingPage.module.scss';

const METHOD_STEPS = [
  { Icon: BookOpenText, id: 'choose', translationIndex: 0 },
  { Icon: Repeat2, id: 'review', translationIndex: 1 },
  { Icon: TrendingUp, id: 'progress', translationIndex: 2 },
] as const;

export function LandingPage(): ReactElement {
  const { t } = useTranslation('common');
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';

  if (status === 'initializing') {
    return <AppLoader label={t('app.loading')} />;
  }

  return (
    <section className={styles.page}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7">
        <Link
          aria-label={t('landing.homeLabel')}
          className="focus-visible:ring-action rounded-control focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          to="/"
        >
          <BrandLogo alt="" aria-hidden="true" className="w-36 sm:w-44" priority />
        </Link>
        <Link
          aria-label={
            isAuthenticated ? t('landing.openApplication') : t('landing.openAuthentication')
          }
          className="border-line-strong bg-surface/80 text-ink hover:border-action hover:text-action focus-visible:ring-action inline-flex size-12 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-[color,border-color,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
          to={isAuthenticated ? '/app' : '/auth'}
        >
          <CircleUserRound aria-hidden="true" size={24} strokeWidth={1.8} />
        </Link>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-14 sm:px-8 sm:pt-14 sm:pb-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.08fr_0.92fr] md:gap-16">
          <div className={styles.heroCopy}>
            <p className="text-action text-xs font-black tracking-[0.18em] uppercase sm:text-sm">
              {t('landing.eyebrow')}
            </p>
            <h1 className="font-display text-ink mt-4 max-w-2xl text-4xl leading-[1.03] font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {t('landing.title')}
            </h1>
            <p className="text-muted mt-5 max-w-xl text-lg leading-8">{t('landing.description')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="bg-action hover:bg-action-hover active:bg-action-active focus-visible:ring-action rounded-control shadow-card inline-flex min-h-12 items-center justify-center px-6 font-bold text-white transition-[background-color,box-shadow,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] motion-reduce:transform-none"
                to={isAuthenticated ? '/app' : '/auth'}
              >
                {isAuthenticated ? t('landing.continueAction') : t('landing.signInAction')}
              </Link>
              <a
                className="text-action hover:bg-action-soft focus-visible:ring-action rounded-control inline-flex min-h-12 items-center justify-center px-5 font-bold transition-colors duration-[var(--kl-motion-fast)] focus-visible:ring-2 focus-visible:outline-none"
                href="#how-it-works"
              >
                {t('landing.howAction')}
              </a>
            </div>
          </div>

          <Card
            className={`${styles.sampleCard} bg-surface/85 grid min-h-72 place-items-center p-8 text-center backdrop-blur sm:min-h-80 sm:p-10`}
          >
            <div>
              <span className="text-action text-xs font-black tracking-[0.18em] uppercase">
                {t('landing.sample.kana')}
              </span>
              <strong
                className="font-japanese text-ink mt-4 block text-5xl font-bold sm:text-6xl"
                lang="ja"
              >
                {t('landing.sample.word')}
              </strong>
              <span className="text-muted mt-5 block text-lg font-semibold">
                {t('landing.sample.meaning')}
              </span>
            </div>
          </Card>
        </div>

        <section className="scroll-mt-24 pt-20 sm:pt-28" id="how-it-works">
          <div className="max-w-2xl">
            <p className="text-action text-xs font-black tracking-[0.18em] uppercase">
              {t('landing.methodEyebrow')}
            </p>
            <h2 className="font-display text-ink mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {t('landing.methodTitle')}
            </h2>
            <p className="text-muted mt-3 leading-7">{t('landing.methodDescription')}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {METHOD_STEPS.map(({ Icon, id, translationIndex }) => (
              <Card className={`${styles.methodCard} p-6`} key={id}>
                <span className="bg-action-soft text-action flex size-11 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <h3 className="text-ink mt-5 text-lg font-black">
                  {t(`landing.steps.${translationIndex}.title`)}
                </h3>
                <p className="text-muted mt-2 leading-6">
                  {t(`landing.steps.${translationIndex}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <footer className="border-line mt-16 flex flex-col gap-5 border-t pt-8 sm:mt-24 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-ink text-sm font-bold">{t('languageSelector.prompt')}</p>
            <LanguageSelector />
          </div>
          <p className="text-muted max-w-sm text-sm leading-6">{t('landing.accountNote')}</p>
        </footer>
      </div>
    </section>
  );
}
