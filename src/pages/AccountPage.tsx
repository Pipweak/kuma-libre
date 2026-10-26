import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { getAuthErrorCode, getUserInitial } from '@/features/auth/authPresentation';
import { useAuth } from '@/features/auth/useAuth';
import { Button, Card } from '@/shared/ui';

export function AccountPage(): ReactElement {
  const { t } = useTranslation('auth');
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const signOutButtonRef = useRef<HTMLButtonElement>(null);
  const wasConfirmingRef = useRef(false);
  const user = session?.user;

  useEffect(() => {
    if (isConfirming) {
      cancelButtonRef.current?.focus();
    } else if (wasConfirmingRef.current) {
      signOutButtonRef.current?.focus();
    }

    wasConfirmingRef.current = isConfirming;
  }, [isConfirming]);

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape' && !isSigningOut) {
      event.preventDefault();
      setIsConfirming(false);
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
    <section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <Link className="text-action text-sm font-bold hover:underline" to="/app/lessons">
        {t('account.back')}
      </Link>
      <h1 className="font-display text-ink mt-4 text-3xl font-black sm:text-4xl">
        {t('account.title')}
      </h1>

      <Card className="mt-6 p-6 sm:p-8">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="bg-success text-ink flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-black">
              {getUserInitial(user.displayName, user.email)}
            </span>
            <div className="min-w-0">
              <p className="text-ink truncate text-lg font-black">
                {user.displayName || t('account.fallbackName')}
              </p>
              <p className="text-muted truncate text-sm">{user.email}</p>
            </div>
          </div>
        ) : null}

        <Button
          className="mt-7 w-full sm:w-auto"
          onClick={() => setIsConfirming(true)}
          ref={signOutButtonRef}
          variant="secondary"
        >
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

      {isConfirming ? (
        <div
          aria-labelledby="sign-out-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onKeyDown={handleDialogKeyDown}
          role="dialog"
        >
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-ink text-2xl font-black" id="sign-out-title">
              {t('account.confirmTitle')}
            </h2>
            <p className="text-muted mt-3 leading-7">{t('account.confirmDescription')}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                disabled={isSigningOut}
                onClick={() => setIsConfirming(false)}
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
