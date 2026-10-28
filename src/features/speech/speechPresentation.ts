import type { QuizQuestion } from '@/domain/quiz';
import type { CorpusLocale } from '@/domain/vocabulary';
import type { SupportedLocale } from '@/shared/i18n/i18n';

export type SpeechRequest = {
  language: string;
  text: string;
};

const SPEECH_LANGUAGE_BY_LOCALE: Record<CorpusLocale, string> = {
  en: 'en-CA',
  es: 'es-ES',
  fr: 'fr-FR',
};

/** Removes study-only markers that should not be pronounced by browser voices. */
export function sanitizeSpeechText(text: string): string {
  return text
    .replace(/[～~]/gu, '')
    .replace(/\[[^[]*\]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

/** Builds the spoken question, preferring kana over displayed kanji for Japanese. */
export function getQuestionSpeechRequest(question: QuizQuestion): SpeechRequest | null {
  if (question.prompt.kind === 'meaning') {
    const text = sanitizeSpeechText(question.prompt.text);
    return text ? { language: SPEECH_LANGUAGE_BY_LOCALE[question.prompt.locale], text } : null;
  }

  const text = sanitizeSpeechText(question.prompt.kana[0] ?? question.prompt.kanji[0] ?? '');
  return text ? { language: 'ja-JP', text } : null;
}

/** Selects recognition locale from the expected answer rather than the displayed prompt. */
export function getAnswerSpeechLanguage(
  question: QuizQuestion,
  activeLocale: SupportedLocale,
): string {
  return question.direction === 'production' ? 'ja-JP' : SPEECH_LANGUAGE_BY_LOCALE[activeLocale];
}
