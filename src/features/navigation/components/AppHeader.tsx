import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, matchPath } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import type { AuthUser } from '@/features/auth/authTypes';
import { formatLessonNumber } from '@/features/lessons/lessonPresentation';
import { ProfileMenu } from '@/features/navigation/components/ProfileMenu';
import { BrandLogo } from '@/shared/ui';

export type AppHeaderProps = {
  pathname: string;
  user: AuthUser;
};

type SecondaryHeaderConfig = {
  backTo: string;
  showProfile: boolean;
  title: string;
};

/** Resolves the compact mobile-first header used by authenticated browsing pages. */
export function AppHeader({ pathname, user }: AppHeaderProps): ReactElement {
  const { t } = useTranslation(['common', 'lessons', 'progress', 'auth']);
  const lessonMatch = matchPath('/app/lessons/:lessonId', pathname);
  let secondaryHeader: SecondaryHeaderConfig | null = null;

  if (lessonMatch) {
    const lesson = vocabularyCorpus.lessons.find(
      (candidate) => candidate.id === lessonMatch.params.lessonId,
    );
    secondaryHeader = {
      backTo: '/app/lessons',
      showProfile: true,
      title:
        lesson === undefined
          ? t('lessons:notFound.title')
          : t('lessons:lessonLabel', { number: formatLessonNumber(lesson.number) }),
    };
  } else if (pathname === '/app/progress') {
    secondaryHeader = {
      backTo: '/app',
      showProfile: true,
      title: t('progress:headerTitle'),
    };
  } else if (pathname === '/app/settings/language') {
    secondaryHeader = {
      backTo: '/app',
      showProfile: true,
      title: t('common:languagePage.title'),
    };
  } else if (pathname === '/app/account') {
    secondaryHeader = {
      backTo: '/app',
      showProfile: false,
      title: t('auth:account.title'),
    };
  }

  return (
    <header className="border-line bg-surface/95 sticky top-0 z-20 border-b backdrop-blur">
      {secondaryHeader ? (
        <div className="mx-auto grid min-h-16 w-full max-w-5xl grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 px-4 sm:px-6">
          <Link
            aria-label={t('common:navigation.back')}
            className="border-line text-ink hover:border-action hover:text-action focus-visible:ring-action flex size-11 items-center justify-center rounded-full border bg-white transition-[color,border-color,transform] duration-[var(--kl-motion-fast)] ease-[var(--kl-ease-standard)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96] motion-reduce:transform-none"
            to={secondaryHeader.backTo}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </Link>
          <strong className="text-ink truncate text-center text-base font-black sm:sr-only">
            {secondaryHeader.title}
          </strong>
          {secondaryHeader.showProfile ? <ProfileMenu user={user} /> : <span aria-hidden="true" />}
        </div>
      ) : (
        <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            aria-label={t('common:app.goToHome')}
            className="focus-visible:ring-action rounded-control focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            to="/app"
          >
            <BrandLogo className="w-32 sm:w-40" priority />
          </Link>
          <ProfileMenu user={user} />
        </div>
      )}
    </header>
  );
}
