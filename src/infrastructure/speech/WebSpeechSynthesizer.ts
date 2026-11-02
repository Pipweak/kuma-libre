import type { SpeechSynthesisOptions, SpeechSynthesizer } from '@/features/speech/SpeechServices';

export type BrowserSpeechVoice = {
  default: boolean;
  lang: string;
};

export type BrowserSpeechUtterance = {
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  rate: number;
  voice: BrowserSpeechVoice | null;
};

export type BrowserSpeechSynthesis = {
  cancel(): void;
  getVoices(): readonly BrowserSpeechVoice[];
  speak(utterance: BrowserSpeechUtterance): void;
};

export type SpeechUtteranceFactory = (text: string) => BrowserSpeechUtterance;

function getBrowserSynthesis(): BrowserSpeechSynthesis | null {
  return typeof window === 'undefined' || !('speechSynthesis' in window)
    ? null
    : (window.speechSynthesis as unknown as BrowserSpeechSynthesis);
}

function getUtteranceFactory(): SpeechUtteranceFactory | null {
  return typeof SpeechSynthesisUtterance === 'undefined'
    ? null
    : (text) => new SpeechSynthesisUtterance(text) as unknown as BrowserSpeechUtterance;
}

function chooseVoice(
  voices: readonly BrowserSpeechVoice[],
  requestedLanguage: string,
): BrowserSpeechVoice | null {
  const normalizedLanguage = requestedLanguage.toLowerCase();
  const baseLanguage = normalizedLanguage.split('-')[0];
  const preferredFallbacks: Record<string, readonly string[]> = {
    'en-ca': ['en-us'],
    'es-es': ['es-mx'],
  };

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLanguage) ??
    preferredFallbacks[normalizedLanguage]
      ?.map((language) => voices.find((voice) => voice.lang.toLowerCase() === language))
      .find((voice) => voice !== undefined) ??
    voices.find((voice) => voice.lang.toLowerCase().split('-')[0] === baseLanguage) ??
    voices.find((voice) => voice.default) ??
    voices[0] ??
    null
  );
}

/** Browser SpeechSynthesis adapter with deterministic locale-aware voice selection. */
export class WebSpeechSynthesizer implements SpeechSynthesizer {
  private activeResolve: (() => void) | null = null;

  constructor(
    private readonly synthesis: BrowserSpeechSynthesis | null = getBrowserSynthesis(),
    private readonly createUtterance: SpeechUtteranceFactory | null = getUtteranceFactory(),
  ) {}

  isSupported(): boolean {
    return this.synthesis !== null && this.createUtterance !== null;
  }

  speak(text: string, options: SpeechSynthesisOptions): Promise<void> {
    if (this.synthesis === null || this.createUtterance === null) {
      return Promise.reject(new Error('speech-synthesis-unsupported'));
    }

    this.stop();
    const utterance = this.createUtterance(text);
    utterance.lang = options.language;
    utterance.rate = options.rate ?? 1;
    utterance.voice = chooseVoice(this.synthesis.getVoices(), options.language);

    return new Promise<void>((resolve, reject) => {
      let hasSettled = false;
      const finish = (error?: Error): void => {
        if (hasSettled) {
          return;
        }

        hasSettled = true;
        this.activeResolve = null;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      this.activeResolve = () => finish();
      utterance.onend = () => finish();
      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          finish();
        } else {
          finish(new Error(event.error ?? 'speech-synthesis-error'));
        }
      };

      try {
        this.synthesis!.speak(utterance);
      } catch (error) {
        finish(error instanceof Error ? error : new Error('speech-synthesis-error'));
      }
    });
  }

  stop(): void {
    this.synthesis?.cancel();
    this.activeResolve?.();
    this.activeResolve = null;
  }
}
