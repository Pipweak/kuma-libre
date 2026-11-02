import { AuthRepositoryError, type AuthRepositoryErrorCode } from '@/features/auth/authTypes';

export function getAuthErrorCode(error: unknown): AuthRepositoryErrorCode {
  return error instanceof AuthRepositoryError ? error.code : 'provider-error';
}

export function getUserInitial(displayName: string | undefined, email: string): string {
  const source = displayName?.trim() || email.trim();
  return source.charAt(0).toLocaleUpperCase() || '?';
}
