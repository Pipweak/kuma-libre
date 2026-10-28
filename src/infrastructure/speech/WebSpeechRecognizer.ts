import {
  SpeechRecognitionFailure,
  type SpeechRecognitionErrorCode,
  type SpeechRecognitionOptions,
  type SpeechRecognizer,
} from '@/features/speech/SpeechServices';

export type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

export type BrowserSpeechRecognitionResult = {
  readonly [index: number]: BrowserSpeechRecognitionAlternative | undefined;
};

export type BrowserSpeechRecognitionEvent = {
  results: {
    readonly [index: number]: BrowserSpeechRecognitionResult | undefined;
  };
};

export type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  abort(): void;
  start(): void;
  stop(): void;
};

export type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const browserWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

function mapRecognitionError(error: string): SpeechRecognitionErrorCode {
  if (error === 'aborted') {
    return 'cancelled';
  }

  if (error === 'not-allowed' || error === 'service-not-allowed') {
    return 'permission-denied';
  }

  if (error === 'no-speech') {
    return 'no-speech';
  }

  return 'network-error';
}

/** Browser SpeechRecognition adapter that never stores or exposes raw audio. */
export class WebSpeechRecognizer implements SpeechRecognizer {
  private activeRecognition: BrowserSpeechRecognition | null = null;
  private activeReject: ((error: SpeechRecognitionFailure) => void) | null = null;

  constructor(
    private readonly RecognitionConstructor: SpeechRecognitionConstructor | null = getSpeechRecognitionConstructor(),
  ) {}

  isSupported(): boolean {
    return this.RecognitionConstructor !== null;
  }

  start(options: SpeechRecognitionOptions): Promise<string> {
    if (this.RecognitionConstructor === null) {
      return Promise.reject(new SpeechRecognitionFailure('unsupported'));
    }

    this.cancel();
    const recognition = new this.RecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = options.language;
    recognition.maxAlternatives = options.maxAlternatives ?? 3;
    this.activeRecognition = recognition;

    return new Promise<string>((resolve, reject) => {
      let hasSettled = false;
      const clear = (): void => {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.onstart = null;
        if (this.activeRecognition === recognition) {
          this.activeRecognition = null;
          this.activeReject = null;
        }
      };
      const finishWithError = (code: SpeechRecognitionErrorCode): void => {
        if (hasSettled) {
          return;
        }

        hasSettled = true;
        clear();
        reject(new SpeechRecognitionFailure(code));
      };
      const finishWithTranscript = (transcript: string): void => {
        if (hasSettled) {
          return;
        }

        const normalizedTranscript = transcript.trim();
        if (!normalizedTranscript) {
          finishWithError('no-speech');
          return;
        }

        hasSettled = true;
        clear();
        resolve(normalizedTranscript);
      };

      this.activeReject = (error) => finishWithError(error.code);
      recognition.onstart = options.onListening;
      recognition.onresult = (event) => {
        finishWithTranscript(event.results[0]?.[0]?.transcript ?? '');
      };
      recognition.onerror = (event) => finishWithError(mapRecognitionError(event.error));
      recognition.onend = () => finishWithError('no-speech');

      try {
        recognition.start();
      } catch (error) {
        const code =
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'permission-denied'
            : 'network-error';
        finishWithError(code);
      }
    });
  }

  stop(): void {
    try {
      this.activeRecognition?.stop();
    } catch {
      this.activeReject?.(new SpeechRecognitionFailure('network-error'));
    }
  }

  cancel(): void {
    const recognition = this.activeRecognition;
    const reject = this.activeReject;
    this.activeRecognition = null;
    this.activeReject = null;

    if (recognition !== null) {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.abort();
      reject?.(new SpeechRecognitionFailure('cancelled'));
    }
  }
}
