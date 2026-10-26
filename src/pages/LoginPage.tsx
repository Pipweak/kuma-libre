import { ArrowLeft, Mail } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router';

import { createAuthCallbackUrl, resolveSafeReturnTo } from '@/features/auth/authNavigation';
import { getAuthErrorCode } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { BrandLogo, Button, Card, Spinner } from '@/shared/ui';

export function LoginPage(): ReactElement {
  const { t } = useTranslation('auth');
  const { session, signInWithGoogle, signInWithMagicLink, status } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<'email' | 'google' | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const returnTo = resolveSafeReturnTo(searchParams.get('returnTo'));

  if (status === 'initializing') {
    return (
      <div className="bg-canvas flex min-h-dvh items-center justify-center">
        <Spinner label={t('loading')} size="lg" />
      </div>
    );
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

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorKey(null);
    setPendingMethod('email');

    try {
      await signInWithMagicLink(email.trim(), callbackUrl);
      setIsEmailSent(true);
    } catch (error) {
      setErrorKey(`errors.${getAuthErrorCode(error)}`);
    } finally {
      setPendingMethod(null);
    }
  }

  if (isEmailSent) {
    return (
      <section className="bg-canvas flex min-h-dvh items-center px-5 py-10">
        <Card className="mx-auto w-full max-w-md p-7 text-center sm:p-10">
          <span className="bg-action-soft text-action mx-auto flex size-14 items-center justify-center rounded-full">
            <Mail aria-hidden="true" size={26} />
          </span>
          <p className="text-action mt-6 text-xs font-black tracking-[0.18em] uppercase">
            {t('emailSent.eyebrow')}
          </p>
          <h1 className="font-display text-ink mt-2 text-3xl font-black">{t('emailSent.title')}</h1>
          <p className="text-muted mt-3 leading-7">{t('emailSent.description', { email })}</p>
          <Button className="mt-7 w-full" onClick={() => setIsEmailSent(false)} variant="secondary">
            {t('emailSent.changeEmail')}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="bg-canvas min-h-dvh px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          className="text-muted hover:text-ink focus-visible:ring-action rounded-control inline-flex min-h-11 items-center gap-2 px-2 font-semibold focus-visible:ring-2 focus-visible:outline-none"
          to="/"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {t('back')}
        </Link>

        <BrandLogo alt="Kuma Libre" className="mx-auto mt-6 w-40" priority />

        <Card className="mt-8 p-6 sm:p-8">
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
            className="mt-6 w-full"
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

          <div className="my-6 flex items-center gap-3" role="separator">
            <span className="bg-line h-px flex-1" />
            <span className="text-muted text-xs font-semibold">{t('or')}</span>
            <span className="bg-line h-px flex-1" />
          </div>

          <form className="space-y-4" onSubmit={(event) => void handleEmailSignIn(event)}>
            <label className="text-ink block text-sm font-bold" htmlFor="auth-email">
              {t('emailLabel')}
            </label>
            <input
              autoComplete="email"
              className="border-line-strong bg-surface-strong text-ink rounded-control focus:border-action focus:ring-action min-h-12 w-full border px-4 outline-none focus:ring-2"
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

          <p className="text-muted mt-6 text-center text-xs leading-5">{t('legal')}</p>
        </Card>
      </div>
    </section>
  );
}
