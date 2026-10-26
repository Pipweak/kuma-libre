import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { resolveSafeReturnTo } from '@/features/auth/authNavigation';
import { getAuthErrorCode } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { BrandLogo, Card, Spinner } from '@/shared/ui';

export function AuthCallbackPage(): ReactElement {
  const { t } = useTranslation('auth');
  const { completeSignIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const returnTo = resolveSafeReturnTo(searchParams.get('returnTo'));

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    void completeSignIn(window.location.href)
      .then(() => navigate(returnTo, { replace: true }))
      .catch((error: unknown) => setErrorKey(`errors.${getAuthErrorCode(error)}`));
  }, [completeSignIn, navigate, returnTo]);

  return (
    <section className="bg-canvas flex min-h-dvh items-center px-5 py-10">
      <Card className="mx-auto w-full max-w-md p-8 text-center">
        <BrandLogo alt="" aria-hidden="true" className="mx-auto w-36" priority />
        {errorKey ? (
          <>
            <h1 className="font-display text-ink mt-7 text-3xl font-black">
              {t('callback.errorTitle')}
            </h1>
            <p className="text-muted mt-3 leading-7" role="alert">
              {t(errorKey)}
            </p>
            <Link
              className="bg-action hover:bg-action-hover focus-visible:ring-action rounded-control mt-7 inline-flex min-h-12 w-full items-center justify-center px-6 font-bold text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              to={`/auth?${new URLSearchParams({ returnTo }).toString()}`}
            >
              {t('callback.retry')}
            </Link>
          </>
        ) : (
          <>
            <Spinner className="mx-auto mt-8" label={t('callback.loading')} size="lg" />
            <h1 className="font-display text-ink mt-5 text-3xl font-black">
              {t('callback.title')}
            </h1>
            <p className="text-muted mt-3 leading-7">{t('callback.description')}</p>
          </>
        )}
      </Card>
    </section>
  );
}
