import { describe, expect, it } from 'vitest';

import { areSerializedCorporaEquivalent, serializeVocabularyCorpus } from './serializeCorpus';

describe('corpus serialization', () => {
  it('treats Git CRLF conversion as equivalent to the canonical LF artifact', () => {
    const canonical = '{\n  "schemaVersion": 1\n}\n';
    const windowsCheckout = canonical.replaceAll('\n', '\r\n');

    expect(areSerializedCorporaEquivalent(windowsCheckout, canonical)).toBe(true);
  });

  it('still detects a real corpus content difference', () => {
    expect(areSerializedCorporaEquivalent('{"schemaVersion":1}\n', '{"schemaVersion":2}\n')).toBe(
      false,
    );
  });

  it('serializes a corpus with stable indentation and a trailing LF', () => {
    expect(
      serializeVocabularyCorpus({ categories: [], entries: [], lessons: [], schemaVersion: 1 }),
    ).toBe(`{
  "categories": [],
  "entries": [],
  "lessons": [],
  "schemaVersion": 1
}\n`);
  });
});
