import { describe, expect, it } from 'vitest';
import { vocab } from './pww-oct26';

describe('vocabulaire chapitre 1', () => {
  it('has 4 parts of 20 words', () => {
    for (const part of ['A', 'B', 'E', 'F']) {
      expect(vocab.filter((v) => v.part === part)).toHaveLength(20);
    }
    expect(vocab).toHaveLength(80);
  });

  it('has unique ids', () => {
    expect(new Set(vocab.map((v) => v.id)).size).toBe(80);
  });

  it('keeps the words as printed', () => {
    expect(vocab.find((v) => v.id === 'B-le-temps')!.nl).toBe('het weer, de tijd');
    expect(vocab.find((v) => v.id === 'B-la-soeur')!.fr).toBe('la sœur');
    expect(vocab.find((v) => v.id === 'A-aux-pays-bas')!.gender).toBe('m mv');
  });
});
