import { createContext } from 'react';

import type { SpeechServices } from '@/features/speech/SpeechServices';

export const SpeechContext = createContext<SpeechServices | null>(null);
