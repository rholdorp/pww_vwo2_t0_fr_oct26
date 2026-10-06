import type { ItemInfo } from '../content/items';
import type { ItemState } from './mastery';

/** Items that go wrong most often and are not yet automated (progress-overview). */
export function weakPoints(items: ItemInfo[], states: Map<string, ItemState>, max = 5): ItemInfo[] {
  return items
    .filter((i) => {
      const s = states.get(i.id);
      return s !== undefined && s.wrong >= 2 && s.level <= 2;
    })
    .sort((a, b) => states.get(b.id)!.wrong - states.get(a.id)!.wrong)
    .slice(0, max);
}
