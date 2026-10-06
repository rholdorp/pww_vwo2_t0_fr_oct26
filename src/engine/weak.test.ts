import { describe, expect, it } from 'vitest';
import type { ItemInfo } from '../content/items';
import type { AnswerRecord } from './mastery';
import { replay } from './mastery';
import { weakPoints } from './weak';

const item: ItemInfo = { id: 'spell:manger:nous', block: 1, label: 'manger - nous mangeons' };
const ans = (correct: boolean, at: number): AnswerRecord => ({
  items: { [item.id]: correct }, ms: 3000, fast: false, at, mode: 'type', sessionId: 's',
});

describe('weak points', () => {
  it('lists an item that went wrong three times', () => {
    const states = replay([ans(false, 1), ans(true, 2), ans(false, 3), ans(false, 4)]);
    expect(weakPoints([item], states).map((i) => i.label)).toEqual(['manger - nous mangeons']);
  });

  it('skips items that are fine now', () => {
    expect(weakPoints([item], replay([ans(true, 1)]))).toEqual([]);
  });
});
