import { describe, expect, it } from 'vitest';

import { dictationReducer, INITIAL_DICTATION_STATE } from '@/features/speech/dictationState';

describe('dictationReducer', () => {
  it('represents every visible dictation phase', () => {
    const permission = dictationReducer(INITIAL_DICTATION_STATE, { type: 'permission' });
    const listening = dictationReducer(permission, { type: 'listening' });
    const transcribing = dictationReducer(listening, { type: 'transcribing' });
    const ready = dictationReducer(transcribing, { type: 'ready' });

    expect(permission).toEqual({ status: 'permission' });
    expect(listening).toEqual({ status: 'listening' });
    expect(transcribing).toEqual({ status: 'transcribing' });
    expect(ready).toEqual({ status: 'ready' });
  });

  it('does not replace an active recording with a late permission action', () => {
    expect(dictationReducer({ status: 'listening' }, { type: 'permission' })).toEqual({
      status: 'listening',
    });
    expect(dictationReducer({ status: 'transcribing' }, { type: 'permission' })).toEqual({
      status: 'transcribing',
    });
  });

  it('represents errors, cancellation, and reset', () => {
    expect(
      dictationReducer(INITIAL_DICTATION_STATE, {
        code: 'permission-denied',
        type: 'failed',
      }),
    ).toEqual({ code: 'permission-denied', status: 'error' });
    expect(dictationReducer(INITIAL_DICTATION_STATE, { type: 'cancelled' })).toEqual({
      status: 'cancelled',
    });
    expect(dictationReducer({ status: 'ready' }, { type: 'reset' })).toBe(INITIAL_DICTATION_STATE);
  });
});
