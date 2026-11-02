import { describe, expect, it } from 'vitest';

import { evaluateAnswer, normalizeAnswer } from './normalizeAnswer';

describe('normalizeAnswer', () => {
  it('normalizes Unicode, Latin accents, casing, punctuation and extra whitespace', () => {
    expect(normalizeAnswer('  MÉDECIN…  de\tFAMILLE! ')).toBe('medecin de famille');
    expect(normalizeAnswer('me\u0301dico')).toBe('medico');
    expect(normalizeAnswer('L’école')).toBe('lecole');
  });

  it('keeps Japanese diacritics significant', () => {
    expect(normalizeAnswer('が')).not.toBe(normalizeAnswer('か'));
  });
});

describe('evaluateAnswer', () => {
  it('matches any explicitly registered normalized answer', () => {
    expect(evaluateAnswer('  DOCTOR! ', ['médecin', 'doctor', 'médico'])).toEqual({
      isCorrect: true,
      matchedAnswer: 'doctor',
      normalizedAnswer: 'doctor',
    });
  });

  it('rejects empty and unregistered answers', () => {
    expect(evaluateAnswer('   ', ['doctor'])).toEqual({
      isCorrect: false,
      matchedAnswer: null,
      normalizedAnswer: '',
    });
    expect(evaluateAnswer('nurse', ['doctor']).isCorrect).toBe(false);
  });
});
