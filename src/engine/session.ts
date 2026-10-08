// Session building blocks (practice-sessions spec, design D9).

import type { ContentPack, Lesson, RegularVerb } from '../content/types';
import { itemId } from '../content/items';
import type { Rng } from './generate';
import type { ItemState } from './mastery';
import { dayKey, levelOf } from './mastery';

export const SESSION_MS = 15 * 60 * 1000;
export const NEW_LESSON_THRESHOLD = 0.8;

const seen = (states: Map<string, ItemState>, id: string) => states.get(id)?.firstSeen !== undefined;

/**
 * Items that start a lesson: its grammar items, or all items for a lesson
 * with only words. Practising words in the vocabulary trainer must not skip
 * a grammar lesson (vocab-trainer spec, design D2).
 */
export function startItems(lesson: Lesson): string[] {
  const grammar = lesson.itemIds.filter((id) => !id.startsWith('voc:'));
  return grammar.length ? grammar : lesson.itemIds;
}

/** A lesson counts as offered once one of its start items has been practised (practice tests excluded). */
export function isIntroduced(lesson: Lesson, states: Map<string, ItemState>): boolean {
  return startItems(lesson).some((id) => seen(states, id));
}

/** Moment the lesson was first practised (earliest first answer of its start items). */
export function introducedAt(lesson: Lesson, states: Map<string, ItemState>): number | undefined {
  let first: number | undefined;
  for (const id of startItems(lesson)) {
    const f = states.get(id)?.firstSeen;
    if (f !== undefined && (first === undefined || f < first)) first = f;
  }
  return first;
}

export function introducedLessons(pack: ContentPack, states: Map<string, ItemState>): Lesson[] {
  return pack.lessons.filter((l) => isIntroduced(l, states));
}

/** Lessons strictly in order: the first one not yet offered. */
export function nextLesson(pack: ContentPack, states: Map<string, ItemState>): Lesson | undefined {
  return pack.lessons.find((l) => !isIntroduced(l, states));
}

/** Share (0-1) of the items of offered lessons on level 2 or higher. */
export function masteredShare(pack: ContentPack, states: Map<string, ItemState>): number {
  const ids = introducedLessons(pack, states).flatMap((l) => l.itemIds);
  if (!ids.length) return 1;
  return ids.filter((id) => levelOf(states, id) >= 2).length / ids.length;
}

/** A new lesson is offered automatically from 80% mastery of what was offered before. */
export function readyForNewLesson(pack: ContentPack, states: Map<string, ItemState>): boolean {
  return masteredShare(pack, states) >= NEW_LESSON_THRESHOLD;
}

/** Regular verbs whose meaning has been offered (used for ending and pc drills). */
export function knownVerbs(pack: ContentPack, states: Map<string, ItemState>): RegularVerb[] {
  return pack.regularVerbs.filter((v) => seen(states, itemId.meaning(v, 'nl2fr')) || seen(states, itemId.meaning(v, 'fr2nl')));
}

const RECENT_WRONG_MS = 48 * 3_600_000;

/**
 * Items to practise: all items of offered lessons, plus items answered wrong
 * recently elsewhere (e.g. in a practice test), so mistakes come back.
 */
export function candidateItems(pack: ContentPack, states: Map<string, ItemState>, now = Date.now()): string[] {
  const ids = new Set(introducedLessons(pack, states).flatMap((l) => l.itemIds));
  for (const [id, s] of states) {
    if (s.lastWrongAt !== undefined && now - s.lastWrongAt < RECENT_WRONG_MS) ids.add(id);
  }
  return [...ids];
}

/**
 * Priority for review: new and weak items first, then items not seen for a
 * long time; recent mistakes get a bonus.
 */
export function priority(id: string, states: Map<string, ItemState>, now: number): number {
  const s = states.get(id);
  if (!s) return 100;
  const hours = Math.min((now - s.lastSeen) / 3_600_000, 48);
  const recentWrong = s.lastWrongAt !== undefined && now - s.lastWrongAt < 24 * 3_600_000 ? 15 : 0;
  return (4 - s.level) * 20 + hours / 2 + recentWrong;
}

export function pickNextItem(
  candidates: string[], states: Map<string, ItemState>, recent: string[], now: number, rng: Rng,
): string | undefined {
  const avoid = new Set(recent.slice(-3));
  const pool = candidates.filter((id) => !avoid.has(id));
  const list = pool.length ? pool : candidates;
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const id of list) {
    const score = priority(id, states, now) + rng() * 10;
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}

/** Wrong items come back after 3-5 other questions in the same session. */
export class ReaskQueue {
  private queue: { id: string; at: number }[] = [];

  add(id: string, askedCount: number, rng: Rng): void {
    this.queue = this.queue.filter((e) => e.id !== id);
    this.queue.push({ id, at: askedCount + 3 + Math.floor(rng() * 3) });
  }

  /** Item due once `askedCount` questions have been asked (counting from 0). */
  due(askedCount: number): string | undefined {
    const i = this.queue.findIndex((e) => e.at <= askedCount);
    if (i < 0) return undefined;
    return this.queue.splice(i, 1)[0].id;
  }

  get size(): number {
    return this.queue.length;
  }
}

export interface DayPlan {
  /** Days left before the test, today included (Thu 8 → Mon 12: 4). */
  daysLeft: number;
  /** Lessons planned for today (already offered today included). */
  lessonsToday: Lesson[];
  /** Of those, the ones already offered. */
  doneToday: Lesson[];
  sessionsGoal: number;
  /** Last day before the test: repeat and practice tests. */
  reviewDay: boolean;
  testDay: boolean;
}

export const SESSIONS_PER_DAY = 2;

function daysBetween(fromDay: string, toDay: string): number {
  const [a, b] = [fromDay, toDay].map((d) => {
    const [y, m, dd] = d.split('-').map(Number);
    return Date.UTC(y, m - 1, dd);
  });
  return Math.round((b - a) / 86_400_000);
}

/**
 * Spreads the lessons not offered before today over the days left, keeping
 * the last day before the test for review (design D9).
 */
export function dayPlan(pack: ContentPack, states: Map<string, ItemState>, now: number): DayPlan {
  const today = dayKey(now);
  const daysLeft = Math.max(0, daysBetween(today, pack.testDate));
  const startedBefore = (l: Lesson) => {
    const at = introducedAt(l, states);
    return at !== undefined && dayKey(at) < today;
  };
  const open = pack.lessons.filter((l) => !startedBefore(l));
  const studyDays = Math.max(1, daysLeft - 1);
  const count = daysLeft <= 1 ? open.length : Math.ceil(open.length / studyDays);
  const lessonsToday = open.slice(0, count);
  return {
    daysLeft,
    lessonsToday,
    doneToday: lessonsToday.filter((l) => isIntroduced(l, states)),
    sessionsGoal: SESSIONS_PER_DAY,
    reviewDay: daysLeft === 1,
    testDay: daysLeft === 0,
  };
}
