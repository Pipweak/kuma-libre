/** Enables the temporary authenticated-area preview only in development or explicit test builds. */
export function isAppPreviewEnabled(
  isDevelopment: boolean,
  previewFlag: string | undefined,
): boolean {
  return isDevelopment || previewFlag === 'true';
}
