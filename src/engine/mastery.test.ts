import { describe, expect, it } from 'vitest';
import type { ItemInfo } from '../content/items';
import { allItems } from '../content/items';
import { pack } from '../content/pww-oct26';
import type { AnswerMode, AnswerRecord, ItemState } from './mastery';
import { computeStats, replay, speedLimit } from './mastery';
import type { Question } from './question';

const TUE = new Date(2026, 9, 6, 15, 0).getTime();
const WED = new Date(2026, 9, 7, 9, 0).getTime();
let t = 0;

function ans(id: string, correct: boolean, opts: { mode?: AnswerMode; fast?: boolean; at?: number } = {}): AnswerRecord {
  return {
    items: { [id]: correct }, ms: opts.fast ? 2000 : 9000, fast: opts.fast ?? false,
    at: (opts.at ?? TUE) + t++, mode: opts.mode ?? 'type', sessionId: 's',
  };
}
const level = (answers: AnswerRecord[], id = 'x') => replay(answers).get(id)?.level ?? 0;

describe('levels', () => {
  it('multiple choice correct → 1', () => {
    expect(level([ans('x', true, { mode: 'mc' })])).toBe(1);
  });

  it('typed correctly but slow → 2', () => {
    expect(level([ans('x', true, { mode: 'mc' }), ans('x', true)])).toBe(2);
  });

  it('typed correctly and fast → 3', () => {
    expect(level([ans('x', true, { mode: 'mc' }), ans('x', true, { fast: true })])).toBe(3);
  });

  it('fast again on the same day stays 3', () => {
    expect(level([ans('x', true, { fast: true }), ans('x', true, { fast: true })])).toBe(3);
  });

  it('fast and correct on a later day → 4', () => {
    expect(level([ans('x', true, { fast: true, at: TUE }), ans('x', true, { fast: true, at: WED })])).toBe(4);
  });

  it('a wrong answer drops one level', () => {
    expect(level([ans('x', true, { fast: true }), ans('x', false)])).toBe(2);
  });

  it('never drops below 1 once offered', () => {
    expect(level([ans('x', false)])).toBe(1);
    expect(level([ans('x', true, { mode: 'mc' }), ans('x', false), ans('x', false)])).toBe(1);
  });

  it('replays in time order, whatever the stored order', () => {
    const a = ans('x', true, { fast: true, at: WED });
    const b = ans('x', true, { fast: true, at: TUE });
    expect(level([a, b])).toBe(4);
  });

  it('merges answers from two devices without losing any', () => {
    const phone = Array.from({ length: 20 }, () => ans('x', true));
    const laptop = Array.from({ length: 15 }, () => ans('x', true));
    expect(replay([...phone, ...laptop]).get('x')!.attempts).toBe(35);
  });

  it('counts each item of a combined question', () => {
    const a: AnswerRecord = { ...ans('x', true), items: { 'mean:acheter:nl2fr': true, 'end:pres:nous': false } };
    const s = replay([a]);
    expect(s.get('mean:acheter:nl2fr')!.level).toBe(2);
    expect(s.get('end:pres:nous')!.level).toBe(1);
  });
});

describe('speed limit', () => {
  const v = pack.regularVerbs[0];
  const base = { key: 'k', mode: 'type' as const };
  it('5 s for a single word or form, 8 s for passé composé and test sentences', () => {
    expect(speedLimit({ ...base, kind: 'vocab', word: pack.vocab[0], dir: 'nl2fr' })).toBe(5000);
    const form: Question = { ...base, kind: 'form', tense: 'pres', verb: v, person: 'tu', dutchPrompt: false };
    expect(speedLimit(form)).toBe(5000);
    expect(speedLimit({ ...form, dutchPrompt: true })).toBe(8000);
    expect(speedLimit({ ...form, tense: 'pc' })).toBe(8000);
  });
});

describe('percentages per block', () => {
  it('half mastered, a quarter automated in block 3', () => {
    const items: ItemInfo[] = allItems(pack);
    const vocabItems = items.filter((i) => i.block === 3);
    expect(vocabItems).toHaveLength(160);
    const states = new Map<string, ItemState>();
    vocabItems.slice(0, 80).forEach((it, i) => {
      states.set(it.id, { level: i < 40 ? 3 : 2, firstSeen: 0, lastSeen: 0, attempts: 1, wrong: 0 });
    });
    const stats = computeStats(items, states);
    expect(stats.blocks[3]).toEqual({ total: 160, mastered: 50, automated: 25 });
    expect(stats.blocks[1].mastered).toBe(0);
    expect(stats.total).toEqual({ mastered: 17, automated: 8 });
  });
});
