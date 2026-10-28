import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DictationInput } from '@/features/speech/components/DictationInput';
import { SpeechProvider } from '@/features/speech/SpeechProvider';
import {
  SpeechRecognitionFailure,
  type SpeechRecognitionOptions,
  type SpeechRecognizer,
  type SpeechServices,
} from '@/features/speech/SpeechServices';
import { i18n } from '@/shared/i18n/i18n';

function createServices(recognizer: SpeechRecognizer): SpeechServices {
  return {
    recognizer,
    synthesizer: {
      isSupported: () => true,
      speak: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    },
  };
}

describe('DictationInput', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('transcribes into the editable input without submitting anything', async () => {
    const user = userEvent.setup();
    let resolveRecognition: ((transcript: string) => void) | null = null;
    const stopRecognition = vi.fn();
    const recognizer: SpeechRecognizer = {
      cancel: vi.fn(),
      isSupported: () => true,
      start: vi.fn(
        (options: SpeechRecognitionOptions) =>
          new Promise<string>((resolve) => {
            resolveRecognition = resolve;
            options.onListening();
          }),
      ),
      stop: stopRecognition,
    };
    const handleValueChange = vi.fn();

    render(
      <SpeechProvider services={createServices(recognizer)}>
        <DictationInput
          id="answer"
          label="Ta réponse"
          language="fr-FR"
          onValueChange={handleValueChange}
          resetKey="question-1"
          value=""
        />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Dicter ma réponse' }));
    expect(screen.getByRole('status').textContent).toContain('Dictée en cours');
    await user.click(screen.getByRole('button', { name: 'Arrêter la dictée' }));
    expect(stopRecognition).toHaveBeenCalledOnce();
    expect(screen.getByRole('status').textContent).toContain('Transcription');

    await act(() => {
      resolveRecognition?.('manger');
      return Promise.resolve();
    });

    expect(handleValueChange).toHaveBeenCalledWith('manger');
    expect(screen.getByText('Transcription ajoutée · tu peux la modifier')).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Ta réponse' }));
  });

  it('ignores a transcript returned after the question changed', async () => {
    const user = userEvent.setup();
    let resolveRecognition: ((transcript: string) => void) | null = null;
    const recognizer: SpeechRecognizer = {
      cancel: vi.fn(),
      isSupported: () => true,
      start: vi.fn(
        (options: SpeechRecognitionOptions) =>
          new Promise<string>((resolve) => {
            resolveRecognition = resolve;
            options.onListening();
          }),
      ),
      stop: vi.fn(),
    };
    const handleValueChange = vi.fn();
    const { rerender } = render(
      <SpeechProvider services={createServices(recognizer)}>
        <DictationInput
          id="answer"
          label="Ta réponse"
          language="fr-FR"
          onValueChange={handleValueChange}
          resetKey="question-1"
          value=""
        />
      </SpeechProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Dicter ma réponse' }));

    rerender(
      <SpeechProvider services={createServices(recognizer)}>
        <DictationInput
          id="answer"
          label="Ta réponse"
          language="fr-FR"
          onValueChange={handleValueChange}
          resetKey="question-2"
          value=""
        />
      </SpeechProvider>,
    );
    await act(() => {
      resolveRecognition?.('ancien résultat');
      return Promise.resolve();
    });

    expect(handleValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Transcription ajoutée · tu peux la modifier')).toBeNull();
  });

  it('keeps keyboard entry available after a denied permission', async () => {
    const user = userEvent.setup();
    const recognizer: SpeechRecognizer = {
      cancel: vi.fn(),
      isSupported: () => true,
      start: vi.fn().mockRejectedValue(new SpeechRecognitionFailure('permission-denied')),
      stop: vi.fn(),
    };

    render(
      <SpeechProvider services={createServices(recognizer)}>
        <DictationInput
          id="answer"
          label="Ta réponse"
          language="fr-FR"
          onValueChange={vi.fn()}
          resetKey="question-1"
          value=""
        />
      </SpeechProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Dicter ma réponse' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Microphone non autorisé');
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Ta réponse' }).disabled).toBe(
      false,
    );
    expect(screen.getByRole('button', { name: 'Réessayer la dictée' })).toBeDefined();
  });

  it('hides the microphone when recognition is unsupported', () => {
    render(
      <SpeechProvider
        services={createServices({
          cancel: vi.fn(),
          isSupported: () => false,
          start: vi.fn().mockRejectedValue(new Error('unsupported')),
          stop: vi.fn(),
        })}
      >
        <DictationInput
          id="answer"
          label="Ta réponse"
          language="fr-FR"
          onValueChange={vi.fn()}
          resetKey="question-1"
          value=""
        />
      </SpeechProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Dicter ma réponse' })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Ta réponse' })).toBeDefined();
  });
});
