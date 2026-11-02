import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuizQuestion } from '@/domain/quiz';
import { QuestionAudioButton } from '@/features/speech/components/QuestionAudioButton';
import { SpeechProvider } from '@/features/speech/SpeechProvider';
import type { SpeechServices } from '@/features/speech/SpeechServices';
import { i18n } from '@/shared/i18n/i18n';

const QUESTION: QuizQuestion = {
  acceptedAnswers: ['manger'],
  categoryId: 'vocabulary',
  correction: {
    kana: ['たべます'],
    kanji: ['食べます'],
    meanings: { en: ['eat'], es: ['comer'], fr: ['manger'] },
    romaji: ['tabemasu'],
  },
  direction: 'comprehension',
  entryId: 'entry-1',
  lessonId: 'lesson-06',
  prompt: { kana: ['たべます'], kanji: ['食べます'], kind: 'japanese' },
};

describe('QuestionAudioButton', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('speaks the kana using a Japanese voice request', async () => {
    const user = userEvent.setup();
    const speak = vi.fn().mockResolvedValue(undefined);
    const services: SpeechServices = {
      recognizer: {
        cancel: vi.fn(),
        isSupported: () => false,
        start: vi.fn().mockRejectedValue(new Error('unsupported')),
        stop: vi.fn(),
      },
      synthesizer: { isSupported: () => true, speak, stop: vi.fn() },
    };
    render(
      <SpeechProvider services={services}>
        <QuestionAudioButton question={QUESTION} />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Écouter' }));

    expect(speak).toHaveBeenCalledWith('たべます', { language: 'ja-JP' });
  });

  it('does not render without browser synthesis support', () => {
    const services: SpeechServices = {
      recognizer: {
        cancel: vi.fn(),
        isSupported: () => false,
        start: vi.fn().mockRejectedValue(new Error('unsupported')),
        stop: vi.fn(),
      },
      synthesizer: {
        isSupported: () => false,
        speak: vi.fn().mockRejectedValue(new Error('unsupported')),
        stop: vi.fn(),
      },
    };
    const { container } = render(
      <SpeechProvider services={services}>
        <QuestionAudioButton question={QUESTION} />
      </SpeechProvider>,
    );

    expect(container.innerHTML).toBe('');
  });
});
