export type SpeechRecognitionErrorCode =
  'cancelled' | 'network-error' | 'no-speech' | 'permission-denied' | 'unsupported';

export type SpeechRecognitionOptions = {
  language: string;
  maxAlternatives?: number;
  onListening: () => void;
};

export type SpeechSynthesisOptions = {
  language: string;
  rate?: number;
};

export interface SpeechRecognizer {
  isSupported(): boolean;
  start(options: SpeechRecognitionOptions): Promise<string>;
  stop(): void;
  cancel(): void;
}

export interface SpeechSynthesizer {
  isSupported(): boolean;
  speak(text: string, options: SpeechSynthesisOptions): Promise<void>;
  stop(): void;
}

export type SpeechServices = {
  recognizer: SpeechRecognizer;
  synthesizer: SpeechSynthesizer;
};

/** Error returned by speech recognition adapters with a stable UI-facing reason. */
export class SpeechRecognitionFailure extends Error {
  readonly code: SpeechRecognitionErrorCode;

  constructor(code: SpeechRecognitionErrorCode) {
    super(code);
    this.name = 'SpeechRecognitionFailure';
    this.code = code;
  }
}
