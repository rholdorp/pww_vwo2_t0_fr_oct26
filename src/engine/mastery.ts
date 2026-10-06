// Mastery per item, derived by replaying the answer log (design D5).

import type { ItemInfo } from '../content/items';
import type { Block } from '../content/types';
import type { Question } from './question';

export type AnswerMode = 'mc' | 'type' | 'test';

/** One stored answer. Append-only; never changed afterwards. */
export interface AnswerRecord {
  /** Outcome per item involved in the question. */
  items: Record<string, boolean>;
  ms: number;
  /** Answered within the speed limit of the question type. */
  fast: boolean;
  /** Epoch milliseconds. */
  at: number;
  mode: AnswerMode;
  sessionId: string;
}

/** 0 nieuw, 1 herkent, 2 typt goed, 3 typt snel, 4 blijft hangen. */
export type Level = 0 | 1 | 2 | 3 | 4;

export interface ItemState {
  level: Level;
  /** Local day (YYYY-MM-DD) on which the item first reached level 3. */
  fastDay?: string;
  firstSeen: number;
  lastSeen: number;
  attempts: number;
  wrong: number;
  lastWrongAt?: number;
}

export const SPEED_LIMIT_SINGLE_MS = 5000;
export const SPEED_LIMIT_LONG_MS = 8000;

/** 5 s for one word or form, 8 s for a passé composé or test sentence. */
export function speedLimit(q: Question): number {
  const long = q.kind === 'form' && (q.tense === 'pc' || q.dutchPrompt);
  return long ? SPEED_LIMIT_LONG_MS : SPEED_LIMIT_SINGLE_MS;
}

export function dayKey(at: number): string {
  const d = new Date(at);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function applyAnswer(prev: ItemState | undefined, correct: boolean, a: AnswerRecord): ItemState {
  const s: ItemState = prev ? { ...prev } : { level: 0, firstSeen: a.at, lastSeen: 0, attempts: 0, wrong: 0 };
  s.attempts++;
  s.lastSeen = a.at;
  const today = dayKey(a.at);

  if (!correct) {
    s.wrong++;
    s.lastWrongAt = a.at;
    // One level down, but not below 1 once the item has been offered.
    s.level = Math.max(1, s.level - 1) as Level;
    return s;
  }
  if (a.mode === 'mc') {
    s.level = Math.max(s.level, 1) as Level;
  } else if (!a.fast) {
    s.level = Math.max(s.level, 2) as Level;
  } else if (s.level < 3) {
    s.level = 3;
    s.fastDay = today;
  } else if (s.fastDay && today > s.fastDay) {
    s.level = 4;
  }
  return s;
}

/** Replays answers in time order. */
export function replay(answers: AnswerRecord[]): Map<string, ItemState> {
  const states = new Map<string, ItemState>();
  const sorted = [...answers].sort((x, y) => x.at - y.at);
  for (const a of sorted) {
    for (const [id, correct] of Object.entries(a.items)) {
      states.set(id, applyAnswer(states.get(id), correct, a));
    }
  }
  return states;
}

export function levelOf(states: Map<string, ItemState>, id: string): Level {
  return states.get(id)?.level ?? 0;
}

export interface BlockStat {
  total: number;
  /** Share of items on level >= 2, 0-100. */
  mastered: number;
  /** Share of items on level >= 3, 0-100. */
  automated: number;
}

export interface Stats {
  blocks: Record<Block, BlockStat>;
  /** Average of the three blocks. */
  total: { mastered: number; automated: number };
}

export function computeStats(items: ItemInfo[], states: Map<string, ItemState>): Stats {
  const blocks = {} as Record<Block, BlockStat>;
  for (const b of [1, 2, 3] as Block[]) {
    const inBlock = items.filter((i) => i.block === b);
    const lv = inBlock.map((i) => levelOf(states, i.id));
    const pct = (n: number) => (inBlock.length ? Math.round((n / inBlock.length) * 100) : 0);
    blocks[b] = {
      total: inBlock.length,
      mastered: pct(lv.filter((l) => l >= 2).length),
      automated: pct(lv.filter((l) => l >= 3).length),
    };
  }
  const avg = (k: 'mastered' | 'automated') => Math.round((blocks[1][k] + blocks[2][k] + blocks[3][k]) / 3);
  return { blocks, total: { mastered: avg('mastered'), automated: avg('automated') } };
}
