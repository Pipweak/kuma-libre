import { ArrowLeft, Mail } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';

import { createAuthCallbackUrl, resolveSafeReturnTo } from '@/features/auth/authNavigation';
import { getAuthErrorCode } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { AppLoader, Button, Card } from '@/shared/ui';

import styles from './AuthPage.module.scss';

type AuthView = 'email' | 'methods' | 'sent';

export function LoginPage(): ReactElement {
  const { t } = useTranslation('auth');
  const { session, signInWithGoogle, signInWithMagicLink, status } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [view, setView] = useState<AuthView>('methods');
  const [pendingMethod, setPendingMethod] = useState<'email' | 'google' | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const returnTo = resolveSafeReturnTo(searchParams.get('returnTo'));

  if (status === 'initializing') {
    return <AppLoader label={t('loading')} />;
  }

  if (status === 'authenticated' && session) {
    return <Navigate replace to={returnTo} />;
  }

  const callbackUrl = createAuthCallbackUrl(window.location.origin, returnTo);

  async function handleGoogleSignIn(): Promise<void> {
    setErrorKey(null);
    setPendingMethod('google');

    try {
      await signInWithGoogle(callbackUrl);
    } catch (error) {
      setErrorKey(`errors.${getAuthErrorCode(error)}`);
      setPendingMethod(null);
    }
  }

  async function sendMagicLink(): Promise<void> {
    setErrorKey(null);
    setPendingMethod('email');

    try {
      await signInWithMagicLink(email.trim(), callbackUrl);
      setView('sent');
    } catch (error) {
      setErrorKey(`errors.${getAuthErrorCode(error)}`);
      setView('email');
    } finally {
      setPendingMethod(null);
    }
  }

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await sendMagicLink();
  }

  function showMethods(): void {
    setErrorKey(null);
    setView('methods');
  }

  function showEmail(): void {
    setErrorKey(null);
    setView('email');
  }

  if (view === 'sent') {
    return (
      <section className={`${styles.page} flex items-center px-5 py-10`}>
        <Card className={`${styles.panel} mx-auto w-full max-w-md p-7 text-center sm:p-10`}>
          <span className="bg-success-soft text-success mx-auto flex size-14 items-center justify-center rounded-full">
            <Mail aria-hidden="true" size={26} />
          </span>
          <p className="text-action mt-6 text-xs font-black tracking-[0.18em] uppercase">
            {t('emailSent.eyebrow')}
          </p>
          <h1 className="font-display text-ink mt-2 text-3xl font-black">{t('emailSent.title')}</h1>
          <p className="text-muted mt-3 leading-7">{t('emailSent.description', { email })}</p>

          {errorKey ? (
            <p
              className="border-danger bg-danger-soft text-ink rounded-control mt-5 border p-3 text-sm"
              role="alert"
            >
              {t(errorKey)}
            </p>
          ) : null}

          <Button
            className="mt-7 w-full"
            isLoading={pendingMethod === 'email'}
            loadingLabel={t('emailSent.resending')}
            onClick={() => void sendMagicLink()}
            variant="secondary"
          >
            {t('emailSent.resend')}
          </Button>
          <Button className="mt-2 w-full" onClick={showEmail} variant="ghost">
            {t('emailSent.changeEmail')}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className={`${styles.page} px-5 py-6 sm:px-8 sm:py-10`}>
      <div className="mx-auto w-full max-w-md">
        <header className="grid min-h-12 grid-cols-[3rem_1fr_3rem] items-center">
          {view === 'email' ? (
            <button
              aria-label={t('methodsBack')}
              className="border-line-strong bg-surface/80 text-ink hover:border-action hover:text-action focus-visible:ring-action inline-flex size-11 items-center justify-center rounded-full border transition-[color,border-color,transform] duration-[var(--kl-motion-fast)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
              onClick={showMethods}
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={19} />
            </button>
          ) : (
            <Link
              aria-label={t('back')}
              className="border-line-strong bg-surface/80 text-ink hover:border-action hover:text-action focus-visible:ring-action inline-flex size-11 items-center justify-center rounded-full border transition-[color,border-color,transform] duration-[var(--kl-motion-fast)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
              to="/"
            >
              <ArrowLeft aria-hidden="true" size={19} />
            </Link>
          )}
          <strong className="text-ink text-center text-sm font-black">
            {view === 'email' ? t('emailHeader') : t('header')}
          </strong>
        </header>

        <Card className={`${styles.panel} mt-7 p-6 sm:p-8`}>
          {view === 'methods' ? (
            <div className={styles.view} key="methods">
              <p className="text-action text-xs font-black tracking-[0.18em] uppercase">
                {t('eyebrow')}
              </p>
              <h1 className="font-display text-ink mt-2 text-3xl font-black">{t('title')}</h1>
              <p className="text-muted mt-3 leading-7">{t('description')}</p>

              {errorKey ? (
                <p
                  className="border-danger bg-danger-soft text-ink rounded-control mt-5 border p-3 text-sm"
                  role="alert"
                >
                  {t(errorKey)}
                </p>
              ) : null}

              <Button
                className="mt-7 w-full"
                isLoading={pendingMethod === 'google'}
                loadingLabel={t('googlePending')}
                onClick={() => void handleGoogleSignIn()}
                variant="secondary"
              >
                <span aria-hidden="true" className="text-action text-lg font-black">
                  G
                </span>
                {t('google')}
              </Button>

              <div className="my-5 flex items-center gap-3" role="separator">
                <span className="bg-line h-px flex-1" />
                <span className="text-muted text-xs font-semibold">{t('or')}</span>
                <span className="bg-line h-px flex-1" />
              </div>

              <Button className="w-full" onClick={showEmail} variant="secondary">
                <Mail aria-hidden="true" size={18} />
                {t('emailChoice')}
              </Button>
            </div>
          ) : (
            <div className={styles.view} key="email">
              <p className="text-action text-xs font-black tracking-[0.18em] uppercase">
                {t('emailEyebrow')}
              </p>
              <h1 className="font-display text-ink mt-2 text-3xl font-black">{t('emailTitle')}</h1>
              <p className="text-muted mt-3 leading-7">{t('emailDescription')}</p>

              {errorKey ? (
                <p
                  className="border-danger bg-danger-soft text-ink rounded-control mt-5 border p-3 text-sm"
                  role="alert"
                >
                  {t(errorKey)}
                </p>
              ) : null}

              <form className="mt-7 space-y-4" onSubmit={(event) => void handleEmailSignIn(event)}>
                <label className="text-ink block text-sm font-bold" htmlFor="auth-email">
                  {t('emailLabel')}
                </label>
                <input
                  autoComplete="email"
                  className="border-line-strong bg-surface-strong text-ink rounded-control focus:border-action focus:ring-action min-h-12 w-full border px-4 transition-[border-color,box-shadow] duration-[var(--kl-motion-fast)] outline-none focus:ring-2"
                  id="auth-email"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  type="email"
                  value={email}
                />
                <Button
                  className="w-full"
                  isLoading={pendingMethod === 'email'}
                  loadingLabel={t('emailPending')}
                  type="submit"
                >
                  {t('emailAction')}
                </Button>
              </form>

              <Button
                className="mt-3 w-full"
                isLoading={pendingMethod === 'google'}
                loadingLabel={t('googlePending')}
                onClick={() => void handleGoogleSignIn()}
                variant="ghost"
              >
                {t('useGoogle')}
              </Button>
            </div>
          )}

          <p className="text-muted mt-7 text-center text-xs leading-5">{t('legal')}</p>
        </Card>
      </div>
    </section>
  );
}
