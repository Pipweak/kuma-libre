import { BarChart3, BookOpen, Languages, User, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { getUserInitial } from '@/features/auth/authPresentation';
import type { AuthUser } from '@/features/auth/authTypes';
import { BrandLogo } from '@/shared/ui';

import styles from './ProfileMenu.module.scss';

export type ProfileMenuProps = {
  user: AuthUser;
};

const NAVIGATION_ITEMS = [
  { end: true, icon: BookOpen, key: 'lessons', to: '/app' },
  { end: false, icon: BarChart3, key: 'progress', to: '/app/progress' },
  { end: false, icon: Languages, key: 'language', to: '/app/settings/language' },
  { end: false, icon: User, key: 'account', to: '/app/account' },
] as const;

export function ProfileMenu({ user }: ProfileMenuProps): ReactElement {
  const { t } = useTranslation('common');
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastLinkRef = useRef<HTMLAnchorElement>(null);
  const initial = getUserInitial(user.displayName, user.email);
  const isOpen = isRendered && !isClosing;

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [isClosing]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey && document.activeElement === closeButtonRef.current) {
        event.preventDefault();
        lastLinkRef.current?.focus();
      } else if (!event.shiftKey && document.activeElement === lastLinkRef.current) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function closeMenu(restoreFocus = true): void {
    setIsClosing(true);

    if (restoreFocus) {
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    }
  }

  return (
    <>
      <button
        aria-controls="profile-navigation"
        aria-expanded={isOpen}
        aria-label={t('navigation.open')}
        className="bg-success focus-visible:ring-action flex size-11 items-center justify-center rounded-full font-black text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={() => {
          setIsRendered(true);
          setIsClosing(false);
        }}
        ref={triggerRef}
        type="button"
      >
        {initial}
      </button>

      {isRendered
        ? createPortal(
            <div
              aria-hidden={isClosing || undefined}
              className={`${styles.layer} ${isClosing ? styles.closing : ''}`}
            >
              <button
                aria-label={t('navigation.close')}
                className={styles.backdrop}
                onClick={() => closeMenu()}
                type="button"
              />
              <div
                aria-labelledby="profile-navigation-title"
                aria-modal="true"
                className={styles.drawer}
                id="profile-navigation"
                role="dialog"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="sr-only" id="profile-navigation-title">
                    {t('navigation.title')}
                  </h2>
                  <BrandLogo alt="" aria-hidden="true" className="w-36" />
                  <button
                    aria-label={t('navigation.close')}
                    className="border-line text-ink hover:border-action hover:text-action focus-visible:ring-action flex size-11 items-center justify-center rounded-full border bg-white focus-visible:ring-2 focus-visible:outline-none"
                    onClick={() => closeMenu()}
                    ref={closeButtonRef}
                    type="button"
                  >
                    <X aria-hidden="true" size={20} />
                  </button>
                </div>

                <nav aria-label={t('navigation.label')} className="mt-8 grid gap-2">
                  {NAVIGATION_ITEMS.map(({ end, icon: Icon, key, to }) => (
                    <NavLink
                      className={({ isActive }) =>
                        `rounded-control flex min-h-12 items-center gap-3 px-4 font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                          isActive
                            ? 'bg-action-soft text-action-active focus-visible:ring-action'
                            : 'text-muted hover:bg-canvas-accent hover:text-ink focus-visible:ring-action'
                        }`
                      }
                      key={key}
                      end={end}
                      onClick={() => closeMenu(false)}
                      ref={key === 'account' ? lastLinkRef : undefined}
                      to={to}
                    >
                      <Icon aria-hidden="true" size={19} />
                      {t(`navigation.${key}`)}
                    </NavLink>
                  ))}
                </nav>

                <div className="border-line mt-auto flex items-center gap-3 border-t pt-5">
                  <span className="bg-success flex size-11 shrink-0 items-center justify-center rounded-full font-black text-white">
                    {initial}
                  </span>
                  <span className="min-w-0">
                    <strong className="text-ink block truncate">
                      {user.displayName || user.email}
                    </strong>
                    <small className="text-muted block truncate text-xs">
                      {t('navigation.synchronized')}
                    </small>
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
