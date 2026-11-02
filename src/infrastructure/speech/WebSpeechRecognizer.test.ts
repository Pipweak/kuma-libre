import { describe, expect, it, vi } from 'vitest';

import { SpeechRecognitionFailure } from '@/features/speech/SpeechServices';
import {
  type BrowserSpeechRecognition,
  WebSpeechRecognizer,
} from '@/infrastructure/speech/WebSpeechRecognizer';

class FakeRecognition implements BrowserSpeechRecognition {
  static latest: FakeRecognition | null = null;
  static throwOnStop = false;

  continuous = true;
  interimResults = true;
  lang = '';
  maxAlternatives = 0;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onresult: BrowserSpeechRecognition['onresult'] = null;
  onstart: (() => void) | null = null;
  abort = vi.fn();
  stop = vi.fn(() => {
    if (FakeRecognition.throwOnStop) {
      throw new Error('stop-failure');
    }
  });

  constructor() {
    FakeRecognition.latest = this;
  }

  start(): void {
    this.onstart?.();
  }
}

class PermissionDeniedRecognition extends FakeRecognition {
  override start(): void {
    throw new DOMException('denied', 'NotAllowedError');
  }
}

class FailingRecognition extends FakeRecognition {
  override start(): void {
    throw new Error('browser-failure');
  }
}

describe('WebSpeechRecognizer', () => {
  it('configures recognition and returns the trimmed transcript', async () => {
    const onListening = vi.fn();
    const adapter = new WebSpeechRecognizer(FakeRecognition);
    const completion = adapter.start({ language: 'ja-JP', onListening });
    const recognition = FakeRecognition.latest!;

    expect(adapter.isSupported()).toBe(true);
    expect(recognition.continuous).toBe(false);
    expect(recognition.interimResults).toBe(false);
    expect(recognition.lang).toBe('ja-JP');
    expect(recognition.maxAlternatives).toBe(3);
    expect(onListening).toHaveBeenCalledOnce();
    recognition.onresult?.({ results: { 0: { 0: { transcript: '  たべます  ' } } } });

    await expect(completion).resolves.toBe('たべます');
  });

  it.each([
    ['not-allowed', 'permission-denied'],
    ['service-not-allowed', 'permission-denied'],
    ['no-speech', 'no-speech'],
    ['aborted', 'cancelled'],
    ['audio-capture', 'network-error'],
  ] as const)('maps browser error %s to %s', async (browserError, expectedCode) => {
    const adapter = new WebSpeechRecognizer(FakeRecognition);
    const completion = adapter.start({ language: 'fr-FR', onListening: vi.fn() });
    FakeRecognition.latest!.onerror?.({ error: browserError });

    await expect(completion).rejects.toMatchObject({ code: expectedCode });
  });

  it('stops or cancels the active browser recognition', async () => {
    const adapter = new WebSpeechRecognizer(FakeRecognition);
    const completion = adapter.start({ language: 'fr-FR', onListening: vi.fn() });
    const recognition = FakeRecognition.latest!;

    adapter.stop();
    expect(recognition.stop).toHaveBeenCalledOnce();
    adapter.cancel();
    expect(recognition.abort).toHaveBeenCalledOnce();
    await expect(completion).rejects.toEqual(new SpeechRecognitionFailure('cancelled'));
  });

  it('reports an empty result and a result-less end as no speech', async () => {
    const firstAdapter = new WebSpeechRecognizer(FakeRecognition);
    const emptyResult = firstAdapter.start({ language: 'fr-FR', onListening: vi.fn() });
    FakeRecognition.latest!.onresult?.({ results: { 0: { 0: { transcript: '  ' } } } });
    await expect(emptyResult).rejects.toMatchObject({ code: 'no-speech' });

    const secondAdapter = new WebSpeechRecognizer(FakeRecognition);
    const ended = secondAdapter.start({ language: 'fr-FR', onListening: vi.fn() });
    FakeRecognition.latest!.onend?.();
    await expect(ended).rejects.toMatchObject({ code: 'no-speech' });
  });

  it.each([
    [PermissionDeniedRecognition, 'permission-denied'],
    [FailingRecognition, 'network-error'],
  ] as const)('maps synchronous start failures', async (Recognition, expectedCode) => {
    const adapter = new WebSpeechRecognizer(Recognition);

    await expect(adapter.start({ language: 'fr-FR', onListening: vi.fn() })).rejects.toMatchObject({
      code: expectedCode,
    });
  });

  it('reports a synchronous stop failure as a network error', async () => {
    FakeRecognition.throwOnStop = true;
    const adapter = new WebSpeechRecognizer(FakeRecognition);
    const completion = adapter.start({ language: 'fr-FR', onListening: vi.fn() });

    adapter.stop();
    FakeRecognition.throwOnStop = false;

    await expect(completion).rejects.toMatchObject({ code: 'network-error' });
  });

  it('reports unsupported environments', async () => {
    const adapter = new WebSpeechRecognizer(null);

    expect(adapter.isSupported()).toBe(false);
    await expect(adapter.start({ language: 'fr-FR', onListening: vi.fn() })).rejects.toMatchObject({
      code: 'unsupported',
    });
    adapter.stop();
    adapter.cancel();
  });
});
