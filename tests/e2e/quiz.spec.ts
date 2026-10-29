import { expect, test, type Page } from '@playwright/test';

import corpus from '../../src/generated/corpus.json' with { type: 'json' };

const FIRST_LESSON = corpus.lessons[0]!;
const FIRST_ENTRY = corpus.entries.find((entry) => entry.lessonId === FIRST_LESSON.id)!;

async function openFirstQuiz(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Français' }).click();
  await page.getByRole('link', { name: 'Continuer à réviser' }).click();
  await page.getByRole('link', { name: /Leçon 01/ }).click();
  await page.getByRole('link', { name: 'Réviser cette leçon' }).click();
  await page.getByText('Dans l’ordre', { exact: true }).click();
  await page.getByRole('button', { name: 'Commencer' }).click();
}

test('reviews a real lesson vocabulary entry through the first correction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Français' }).click();
  await page.getByRole('link', { name: 'Continuer à réviser' }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Qu’est-ce qu’on révise ?' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Leçon 01/ }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Leçon 01' })).toBeVisible();
  await page.getByRole('link', { name: 'Réviser cette leçon' }).click();

  await expect(page.getByRole('heading', { name: 'Configurer le quiz' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: '01' })).toBeChecked();
  await page.getByText('Dans l’ordre', { exact: true }).click();
  await page.getByRole('button', { name: 'Commencer' }).click();

  await expect(page.getByText(FIRST_ENTRY.kana[0] ?? FIRST_ENTRY.romaji[0]!)).toBeVisible();
  await page.getByRole('textbox', { name: 'Ta réponse' }).fill(FIRST_ENTRY.meanings.fr[0]!);
  await page.getByRole('button', { name: 'Valider' }).click();

  await expect(page.getByRole('heading', { name: 'Bonne réponse' })).toBeVisible();
  await expect(page.getByText('Significations')).toBeVisible();
  await page.getByRole('button', { name: 'Quitter le quiz' }).click();
  await page.getByRole('button', { name: 'Quitter la passe' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Ton parcours' })).toBeVisible();
  await page.getByRole('link', { name: /Leçon 01/ }).click();
  await expect(page.getByLabel('Comprendre : À revoir, score 1 sur 3')).toBeVisible();
  await page.getByRole('link', { name: 'Réviser cette leçon' }).click();
  await page.getByText('Non maîtrisés', { exact: true }).click();

  await expect(page.getByRole('checkbox', { name: /Non maîtrisés/ })).not.toBeChecked();
  await expect(page.getByText('1 question', { exact: true })).toBeVisible();
});

test('reads the question and inserts a dictated answer without validating it', async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      maxAlternatives = 1;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onstart: (() => void) | null = null;

      constructor() {
        (window as unknown as { __speechRecognition: MockSpeechRecognition }).__speechRecognition =
          this;
      }

      abort(): void {}

      emitResult(transcript: string): void {
        this.onresult?.({ results: { 0: { 0: { transcript } } } });
      }

      start(): void {
        this.onstart?.();
      }

      stop(): void {}
    }

    class MockSpeechSynthesisUtterance {
      lang = '';
      onend: (() => void) | null = null;
      onerror: ((event: { error?: string }) => void) | null = null;
      rate = 1;
      text: string;
      voice: { default: boolean; lang: string } | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, 'SpeechRecognition', { value: MockSpeechRecognition });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel: () => undefined,
        getVoices: () => [{ default: true, lang: 'ja-JP' }],
        speak: (utterance: MockSpeechSynthesisUtterance) => {
          (window as unknown as { __spokenText: string }).__spokenText = utterance.text;
          queueMicrotask(() => utterance.onend?.());
        },
      },
    });
  });
  await openFirstQuiz(page);

  await page.getByRole('button', { name: 'Écouter' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __spokenText?: string }).__spokenText ?? null),
    )
    .toBe(FIRST_ENTRY.kana[0] ?? FIRST_ENTRY.kanji[0]);

  await page.getByRole('button', { name: 'Dicter ma réponse' }).click();
  await expect(page.getByRole('status')).toContainText('Dictée en cours');
  await page.getByRole('button', { name: 'Arrêter la dictée' }).click();
  await expect(page.getByRole('status')).toContainText('Transcription');
  await page.evaluate((transcript) => {
    (
      window as unknown as {
        __speechRecognition: { emitResult(value: string): void };
      }
    ).__speechRecognition.emitResult(transcript);
  }, FIRST_ENTRY.meanings.fr[0]!);

  await expect(page.getByRole('textbox', { name: 'Ta réponse' })).toHaveValue(
    FIRST_ENTRY.meanings.fr[0]!,
  );
  await expect(page.getByText('Transcription ajoutée · tu peux la modifier')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bonne réponse' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Valider' })).toBeEnabled();
});
