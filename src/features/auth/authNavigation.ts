const DEFAULT_AUTHENTICATED_PATH = '/app';

/** Accepts only application-internal protected destinations to prevent open redirects. */
export function resolveSafeReturnTo(value: string | null | undefined): string {
  if (!value?.startsWith('/app')) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const url = new URL(value, 'https://kuma-libre.local');

    if (url.origin !== 'https://kuma-libre.local' || !url.pathname.startsWith('/app')) {
      return DEFAULT_AUTHENTICATED_PATH;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}

export function createLoginPath(returnTo: string): string {
  const search = new URLSearchParams({ returnTo: resolveSafeReturnTo(returnTo) });
  return `/auth?${search.toString()}`;
}

export function createAuthCallbackUrl(origin: string, returnTo: string): string {
  const url = new URL('/auth/callback', origin);
  url.searchParams.set('returnTo', resolveSafeReturnTo(returnTo));
  return url.toString();
}
