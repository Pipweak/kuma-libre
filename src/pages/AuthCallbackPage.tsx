import { CircleAlert } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { resolveSafeReturnTo } from '@/features/auth/authNavigation';
import { getAuthErrorCode } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { Card } from '@/shared/ui';

import styles from './AuthPage.module.scss';

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
    <section className={`${styles.page} flex items-center px-5 py-10`}>
      <Card className={`${styles.panel} mx-auto w-full max-w-md p-8 text-center sm:p-10`}>
        {errorKey ? (
          <>
            <span className="bg-danger-soft text-danger mx-auto flex size-14 items-center justify-center rounded-full">
              <CircleAlert aria-hidden="true" size={26} />
            </span>
            <h1 className="font-display text-ink mt-6 text-3xl font-black">
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
            <span
              aria-label={t('callback.loading')}
              className={styles.callbackMark}
              role="status"
            />
            <h1 className="font-display text-ink mt-6 text-3xl font-black">
              {t('callback.title')}
            </h1>
            <p className="text-muted mt-3 leading-7">{t('callback.description')}</p>
          </>
        )}
      </Card>
    </section>
  );
}
