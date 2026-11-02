import { useContext } from 'react';

import { SpeechContext } from '@/features/speech/SpeechContext';
import type { SpeechServices } from '@/features/speech/SpeechServices';

export function useSpeechServices(): SpeechServices {
  const services = useContext(SpeechContext);

  if (services === null) {
    throw new Error('useSpeechServices must be used within SpeechProvider.');
  }

  return services;
}
