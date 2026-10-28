import type { SpeechRecognitionErrorCode } from '@/features/speech/SpeechServices';

export type DictationState =
  | { status: 'cancelled' }
  | { code: SpeechRecognitionErrorCode; status: 'error' }
  | { status: 'idle' }
  | { status: 'listening' }
  | { status: 'permission' }
  | { status: 'ready' }
  | { status: 'transcribing' };

export type DictationAction =
  | { code: SpeechRecognitionErrorCode; type: 'failed' }
  | { type: 'cancelled' | 'listening' | 'permission' | 'ready' | 'reset' | 'transcribing' };

export const INITIAL_DICTATION_STATE: DictationState = { status: 'idle' };

/** Keeps microphone UI transitions explicit and independent from quiz answer validation. */
export function dictationReducer(state: DictationState, action: DictationAction): DictationState {
  if (action.type === 'failed') {
    return { code: action.code, status: 'error' };
  }

  if (action.type === 'reset') {
    return INITIAL_DICTATION_STATE;
  }

  if (action.type === 'permission') {
    return state.status === 'listening' || state.status === 'transcribing'
      ? state
      : { status: 'permission' };
  }

  return { status: action.type };
}
