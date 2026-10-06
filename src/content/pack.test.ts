import { describe, expect, it } from 'vitest';
import { allItems } from './items';
import { pack } from './pww-oct26';

describe('content pack', () => {
  const items = allItems(pack);

  it('has the test date', () => {
    expect(pack.testDate).toBe('2026-10-12');
  });

  it('puts every item in exactly one lesson', () => {
    const counts = new Map<string, number>();
    for (const l of pack.lessons) for (const id of l.itemIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const it of items) expect(counts.get(it.id), it.id).toBe(1);
    expect(counts.size).toBe(items.length);
  });

  it('only refers to existing explanations', () => {
    const ids = new Set(pack.explanations.map((e) => e.id));
    for (const l of pack.lessons) for (const e of l.explanationIds) expect(ids.has(e), e).toBe(true);
  });

  it('teaches avoir before the passé composé', () => {
    const idx = (id: string) => pack.lessons.findIndex((l) => l.itemIds.includes(id));
    expect(idx('irr:pres:avoir:je')).toBeLessThan(idx('pc:rule'));
    expect(idx('end:pres:nous')).toBeLessThan(idx('pc:rule'));
  });
});

describe('item layout per block (design D3)', () => {
  const items = allItems(pack);
  const count = (b: number) => items.filter((i) => i.block === b).length;

  it('has unique ids', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('block 1: 50 meanings + 6 endings + 19 spellings + 24 irregular forms', () => {
    expect(count(1)).toBe(50 + 6 + 19 + 24);
  });

  it('block 2: rule + 3 participles + 6 auxiliaries', () => {
    expect(count(2)).toBe(10);
  });

  it('block 3: 80 words in both directions', () => {
    expect(count(3)).toBe(160);
  });
});
