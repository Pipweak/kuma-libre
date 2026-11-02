export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
};

export type AuthSession = {
  user: AuthUser;
};

export type AuthRepositoryErrorCode =
  'callback-invalid' | 'configuration' | 'provider-error' | 'session-missing';

/** Error safe to classify in the UI without exposing provider internals. */
export class AuthRepositoryError extends Error {
  readonly code: AuthRepositoryErrorCode;

  constructor(code: AuthRepositoryErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = 'AuthRepositoryError';
    this.code = code;
  }
}
