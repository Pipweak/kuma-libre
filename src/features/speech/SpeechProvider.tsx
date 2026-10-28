import type { PropsWithChildren, ReactElement } from 'react';

import { SpeechContext } from '@/features/speech/SpeechContext';
import type { SpeechServices } from '@/features/speech/SpeechServices';

export type SpeechProviderProps = PropsWithChildren<{
  services: SpeechServices;
}>;

/** Exposes browser speech adapters without coupling pages to infrastructure classes. */
export function SpeechProvider({ children, services }: SpeechProviderProps): ReactElement {
  return <SpeechContext.Provider value={services}>{children}</SpeechContext.Provider>;
}
