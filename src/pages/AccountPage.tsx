import { CheckCircle2, LogOut } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { getAuthErrorCode, getUserInitial } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { Button, Card } from '@/shared/ui';

import styles from './AccountPage.module.scss';

export function AccountPage(): ReactElement {
  const { t } = useTranslation('auth');
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDialogRendered, setIsDialogRendered] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const signOutButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);
  const user = session?.user;
  const isConfirming = isDialogRendered && !isDialogClosing;

  useEffect(() => {
    if (isConfirming) {
      cancelButtonRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      signOutButtonRef.current?.focus();
    }

    wasConfirmingRef.current = isConfirming;
  }, [isConfirming]);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isConfirming]);

  useEffect(() => {
    if (!isDialogClosing) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsDialogRendered(false);
      setIsDialogClosing(false);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [isDialogClosing]);

  function openConfirmation(): void {
    setIsDialogRendered(true);
    setIsDialogClosing(false);
  }

  function closeConfirmation(): void {
    setIsDialogClosing(true);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape' && !isSigningOut) {
      event.preventDefault();
      closeConfirmation();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableButtons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
    );
    const firstButton = focusableButtons[0];
    const lastButton = focusableButtons.at(-1);

    if (!firstButton || !lastButton) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  }

  async function handleSignOut(): Promise<void> {
    setErrorKey(null);
    setIsSigningOut(true);

    try {
      await signOut();
      void navigate('/', { replace: true });
    } catch (error) {
      setErrorKey(`errors.${getAuthErrorCode(error)}`);
      setIsSigningOut(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-7 sm:px-6 sm:py-10">
      <h1 className="font-display text-ink sr-only text-3xl font-black tracking-tight sm:not-sr-only sm:text-4xl">
        {t('account.title')}
      </h1>

      <Card className="mt-6 p-6 sm:p-8">
        {user ? (
          <div className="text-center">
            <span className="bg-success mx-auto flex size-20 items-center justify-center rounded-full text-2xl font-black text-white">
              {getUserInitial(user.displayName, user.email)}
            </span>
            <div className="mt-4 min-w-0">
              <p className="text-ink truncate text-xl font-black">
                {user.displayName || t('account.fallbackName')}
              </p>
              <p className="text-muted mt-1 truncate text-sm">{user.email}</p>
            </div>
          </div>
        ) : null}

        <div className="border-line mt-7 flex items-center gap-3 border-y py-4">
          <CheckCircle2 aria-hidden="true" className="text-success" size={21} />
          <span className="text-ink text-sm font-bold">{t('account.synchronized')}</span>
        </div>

        <Button className="mt-7 w-full" onClick={openConfirmation} ref={signOutButtonRef}>
          <LogOut aria-hidden="true" size={18} />
          {t('account.signOut')}
        </Button>

        {errorKey ? (
          <p
            className="border-danger bg-danger-soft rounded-control mt-4 border p-3 text-sm"
            role="alert"
          >
            {t(errorKey)}
          </p>
        ) : null}
      </Card>

      {isDialogRendered ? (
        <div
          aria-hidden={isDialogClosing || undefined}
          aria-labelledby="sign-out-title"
          aria-modal="true"
          className={`${styles.overlay} ${isDialogClosing ? styles.closing : ''}`}
          onKeyDown={handleDialogKeyDown}
          role="dialog"
        >
          <Card className={`${styles.dialog} p-6`}>
            <h2 className="font-display text-ink text-2xl font-black" id="sign-out-title">
              {t('account.confirmTitle')}
            </h2>
            <p className="text-muted mt-3 leading-7">{t('account.confirmDescription')}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                disabled={isSigningOut}
                onClick={closeConfirmation}
                ref={cancelButtonRef}
                variant="secondary"
              >
                {t('account.cancel')}
              </Button>
              <Button
                isLoading={isSigningOut}
                loadingLabel={t('account.signingOut')}
                onClick={() => void handleSignOut()}
              >
                {t('account.confirmAction')}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
