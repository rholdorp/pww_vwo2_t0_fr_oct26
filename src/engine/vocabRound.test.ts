import { describe, expect, it } from 'vitest';
import { itemId } from '../content/items';
import { pack } from '../content/pww-oct26';
import type { ItemState } from './mastery';
import { buildVocabRound } from './vocabRound';

describe('vocab trainer round', () => {
  it('asks each of the 20 word pairs of a part exactly once, always typed', () => {
    for (const part of ['A', 'B', 'E', 'F'] as const) {
      const round = buildVocabRound(pack, part, new Map(), Math.random);
      expect(round).toHaveLength(20);
      expect(round.every((q) => q.mode === 'type' && q.word.part === part)).toBe(true);
      expect(new Set(round.map((q) => q.word.id)).size).toBe(20);
    }
  });

  it('uses both directions', () => {
    const dirs = new Set<string>();
    for (let i = 0; i < 5; i++) for (const q of buildVocabRound(pack, 'B', new Map(), Math.random)) dirs.add(q.dir);
    expect(dirs).toEqual(new Set(['fr2nl', 'nl2fr']));
  });

  it('shuffles the order', () => {
    const order = () => buildVocabRound(pack, 'A', new Map(), Math.random).map((q) => q.word.id).join();
    expect(new Set([order(), order(), order()]).size).toBeGreaterThan(1);
  });

  it('"all" prefers the weakest words', () => {
    const states = new Map<string, ItemState>();
    for (const w of pack.vocab.filter((v) => v.part !== 'F')) {
      for (const d of ['fr2nl', 'nl2fr'] as const) {
        states.set(itemId.vocab(w, d), { level: 3, firstSeen: 0, lastSeen: 0, attempts: 3, wrong: 0 });
      }
    }
    const round = buildVocabRound(pack, 'all', states, Math.random);
    expect(round).toHaveLength(20);
    expect(round.every((q) => q.word.part === 'F')).toBe(true);
  });

  it('"all" with no progress takes 20 different words from the whole list', () => {
    const round = buildVocabRound(pack, 'all', new Map(), Math.random);
    expect(new Set(round.map((q) => q.word.id)).size).toBe(20);
  });
});
