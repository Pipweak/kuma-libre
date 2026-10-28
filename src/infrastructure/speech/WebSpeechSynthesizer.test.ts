import { describe, expect, it, vi } from 'vitest';

import {
  type BrowserSpeechSynthesis,
  type BrowserSpeechUtterance,
  type BrowserSpeechVoice,
  WebSpeechSynthesizer,
} from '@/infrastructure/speech/WebSpeechSynthesizer';

function createUtterance(): BrowserSpeechUtterance {
  return { lang: '', onend: null, onerror: null, rate: 1, voice: null };
}

describe('WebSpeechSynthesizer', () => {
  it('chooses an exact locale voice and resolves when playback ends', async () => {
    const voices: BrowserSpeechVoice[] = [
      { default: true, lang: 'en-US' },
      { default: false, lang: 'ja-JP' },
    ];
    let utterance: BrowserSpeechUtterance | null = null;
    const synthesis: BrowserSpeechSynthesis = {
      cancel: vi.fn(),
      getVoices: () => voices,
      speak: vi.fn((candidate: BrowserSpeechUtterance) => {
        utterance = candidate;
      }),
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());

    const completion = adapter.speak('たべます', { language: 'ja-JP', rate: 0.9 });
    expect(utterance).not.toBeNull();
    expect(utterance!.lang).toBe('ja-JP');
    expect(utterance!.rate).toBe(0.9);
    expect(utterance!.voice).toBe(voices[1]);
    utterance!.onend?.();

    await expect(completion).resolves.toBeUndefined();
  });

  it('falls back to the same language, then the default voice', async () => {
    const englishVoice = { default: false, lang: 'en-GB' };
    const defaultVoice = { default: true, lang: 'de-DE' };
    let selectedVoice: BrowserSpeechVoice | null = null;
    const synthesis: BrowserSpeechSynthesis = {
      cancel: vi.fn(),
      getVoices: () => [englishVoice, defaultVoice],
      speak: (utterance) => {
        selectedVoice = utterance.voice;
        utterance.onend?.();
      },
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());

    await adapter.speak('hello', { language: 'en-CA' });
    expect(selectedVoice).toBe(englishVoice);
    await adapter.speak('bonjour', { language: 'fr-FR' });
    expect(selectedVoice).toBe(defaultVoice);
  });

  it('prefers the documented regional fallback before another same-language voice', async () => {
    const britishVoice = { default: false, lang: 'en-GB' };
    const americanVoice = { default: false, lang: 'en-US' };
    let selectedVoice: BrowserSpeechVoice | null = null;
    const synthesis: BrowserSpeechSynthesis = {
      cancel: vi.fn(),
      getVoices: () => [britishVoice, americanVoice],
      speak: (utterance) => {
        selectedVoice = utterance.voice;
        utterance.onend?.();
      },
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());

    await adapter.speak('hello', { language: 'en-CA' });

    expect(selectedVoice).toBe(americanVoice);
  });

  it('stops prior playback and reports real synthesis errors', async () => {
    let utterance: BrowserSpeechUtterance | null = null;
    const cancel = vi.fn();
    const synthesis: BrowserSpeechSynthesis = {
      cancel,
      getVoices: () => [],
      speak: (candidate) => {
        utterance = candidate;
      },
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());
    const completion = adapter.speak('hello', { language: 'en-CA' });
    utterance!.onerror?.({ error: 'voice-unavailable' });

    await expect(completion).rejects.toThrow('voice-unavailable');
    expect(cancel).toHaveBeenCalled();
  });

  it.each(['canceled', 'interrupted'])('treats %s playback as a normal stop', async (error) => {
    let utterance: BrowserSpeechUtterance | null = null;
    const synthesis: BrowserSpeechSynthesis = {
      cancel: vi.fn(),
      getVoices: () => [],
      speak: (candidate) => {
        utterance = candidate;
      },
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());
    const completion = adapter.speak('hello', { language: 'en-CA' });
    utterance!.onerror?.({ error });

    await expect(completion).resolves.toBeUndefined();
  });

  it('resolves active playback when explicitly stopped', async () => {
    const cancel = vi.fn();
    const synthesis: BrowserSpeechSynthesis = {
      cancel,
      getVoices: () => [{ default: false, lang: 'it-IT' }],
      speak: vi.fn(),
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());
    const completion = adapter.speak('bonjour', { language: 'fr-FR' });

    adapter.stop();

    await expect(completion).resolves.toBeUndefined();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('rejects synchronous browser synthesis failures', async () => {
    const synthesis: BrowserSpeechSynthesis = {
      cancel: vi.fn(),
      getVoices: () => [],
      speak: () => {
        throw new Error('browser-failure');
      },
    };
    const adapter = new WebSpeechSynthesizer(synthesis, () => createUtterance());

    await expect(adapter.speak('hello', { language: 'en-CA' })).rejects.toThrow('browser-failure');
  });

  it('reports unsupported environments', async () => {
    const adapter = new WebSpeechSynthesizer(null, null);

    expect(adapter.isSupported()).toBe(false);
    await expect(adapter.speak('hello', { language: 'en-CA' })).rejects.toThrow(
      'speech-synthesis-unsupported',
    );
    adapter.stop();
  });
});
