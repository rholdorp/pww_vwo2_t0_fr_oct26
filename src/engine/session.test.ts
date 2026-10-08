import { describe, expect, it } from 'vitest';
import { pack } from '../content/pww-oct26';
import type { GenContext } from './generate';
import { questionFor } from './generate';
import type { ItemState, Level } from './mastery';
import { replay } from './mastery';
import {
  candidateItems, dayPlan, introducedLessons, knownVerbs, nextLesson, pickNextItem, readyForNewLesson, ReaskQueue,
} from './session';

const at = (d: number, h = 10) => new Date(2026, 9, d, h).getTime();
const st = (level: Level, firstSeen = at(6), extra: Partial<ItemState> = {}): ItemState => ({
  level, firstSeen, lastSeen: firstSeen, attempts: 1, wrong: 0, ...extra,
});
const seq = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++ % vals.length];
};

function withLessons(n: number, level: Level, day = 6): Map<string, ItemState> {
  const m = new Map<string, ItemState>();
  for (const l of pack.lessons.slice(0, n)) for (const id of l.itemIds) m.set(id, st(level, at(day)));
  return m;
}

describe('lesson order and the 80% rule', () => {
  it('starts with lesson 1', () => {
    expect(nextLesson(pack, new Map())!.id).toBe('l1');
    expect(readyForNewLesson(pack, new Map())).toBe(true);
  });

  it('waits with a new lesson below 80%', () => {
    const states = withLessons(1, 1);
    const ids = pack.lessons[0].itemIds;
    ids.slice(0, Math.floor(ids.length * 0.6)).forEach((id) => states.set(id, st(2)));
    expect(readyForNewLesson(pack, states)).toBe(false);
  });

  it('offers the next lesson from 80%', () => {
    const states = withLessons(1, 2);
    expect(readyForNewLesson(pack, states)).toBe(true);
    expect(nextLesson(pack, states)!.id).toBe('l2');
  });

  it('never offers the passé composé before avoir', () => {
    const order = pack.lessons.map((l) => l.id);
    expect(order.indexOf('l1')).toBeLessThan(order.indexOf('l5'));
  });
});

describe('picking the next item', () => {
  it('prefers new and weak items', () => {
    const states = new Map<string, ItemState>([['a', st(4, at(7, 9))], ['b', st(1, at(7, 9))]]);
    expect(pickNextItem(['a', 'b'], states, [], at(7, 10), () => 0)).toBe('b');
    expect(pickNextItem(['a', 'c'], states, [], at(7, 10), () => 0)).toBe('c');
  });

  it('does not repeat one of the last 3 items', () => {
    const states = new Map<string, ItemState>([['a', st(1)], ['b', st(4)]]);
    expect(pickNextItem(['a', 'b'], states, ['a'], at(7), () => 0)).toBe('b');
  });

  it('gives recent mistakes a bonus', () => {
    const states = new Map<string, ItemState>([
      ['a', st(2, at(7, 9))],
      ['b', st(2, at(7, 9), { lastWrongAt: at(7, 9) })],
    ]);
    expect(pickNextItem(['a', 'b'], states, [], at(7, 10), () => 0)).toBe('b');
  });
});

describe('re-asking a wrong item', () => {
  it('comes back after 3 to 5 other questions', () => {
    for (const r of [0, 0.5, 0.99]) {
      const q = new ReaskQueue();
      q.add('x', 1, () => r);
      const dueAt = [2, 3, 4, 5, 6, 7].find((n) => {
        const probe = Object.assign(Object.create(ReaskQueue.prototype), structuredClone(q));
        return probe.due(n) === 'x';
      })!;
      expect(dueAt - 1).toBeGreaterThanOrEqual(3);
      expect(dueAt - 1).toBeLessThanOrEqual(5);
    }
  });
});

describe('question form grows with the level', () => {
  const ctx = (states: Map<string, ItemState>): GenContext => ({
    pack, states, rng: seq(0.1, 0.7, 0.3, 0.9), knownVerbs: knownVerbs(pack, states),
  });

  it('new word → multiple choice with four options', () => {
    const q = questionFor('voc:F-la-mer:nl2fr', ctx(new Map()))!;
    expect(q.mode).toBe('mc');
    expect(q.options).toHaveLength(4);
    expect(q.options).toContain('la mer');
  });

  it('level 1 → typing', () => {
    const states = new Map([['voc:F-la-mer:nl2fr', st(1)]]);
    expect(questionFor('voc:F-la-mer:nl2fr', ctx(states))!.mode).toBe('type');
  });

  it('drill until meaning and ending are on level 2, then a test sentence', () => {
    const states = new Map([['mean:donner:nl2fr', st(2)], ['end:pres:ils', st(1)]]);
    let q = questionFor('end:pres:ils', ctx(states))!;
    expect(q.kind === 'form' && q.dutchPrompt).toBe(false);
    states.set('end:pres:ils', st(2));
    const donnerOnly: GenContext = { ...ctx(states), knownVerbs: [pack.regularVerbs.find((v) => v.id === 'donner')!] };
    q = questionFor('end:pres:ils', donnerOnly)!;
    expect(q.kind).toBe('form');
    if (q.kind === 'form') {
      expect(q.dutchPrompt).toBe(true);
      expect(q.subject!.person).toBe('ils');
    }
  });

  it('ending drills skip verbs with a spelling exception for that person', () => {
    const manger = pack.regularVerbs.find((v) => v.id === 'manger')!;
    const parler = pack.regularVerbs.find((v) => v.id === 'parler')!;
    for (let i = 0; i < 20; i++) {
      const q = questionFor('end:pres:nous', { ...ctx(new Map()), rng: Math.random, knownVerbs: [manger, parler] })!;
      expect(q.kind === 'form' && q.verb.id).toBe('parler');
    }
  });

  it('never asks arriver or rentrer in the passé composé', () => {
    for (let i = 0; i < 50; i++) {
      const q = questionFor('pc:rule', { ...ctx(new Map()), rng: Math.random, knownVerbs: pack.regularVerbs })!;
      expect(q.kind === 'form' && ['arriver', 'rentrer'].includes(q.verb.id)).toBe(false);
    }
  });

  it('multiple choice for je uses je/j\' in every option', () => {
    const q = questionFor('irr:pres:avoir:je', ctx(new Map()))!;
    expect(q.options).toContain("j'ai");
    for (const o of q.options!) expect(o.startsWith('je ') || o.startsWith("j'")).toBe(true);
  });
});

describe('day plan', () => {
  it('spreads 7 lessons from Wednesday, keeping Sunday for review', () => {
    const p = dayPlan(pack, new Map(), at(7));
    expect(p.daysLeft).toBe(5);
    expect(p.lessonsToday.map((l) => l.id)).toEqual(['l1', 'l2']);
    expect(p.reviewDay).toBe(false);
  });

  it('shows 4 days left on Thursday 8 October', () => {
    expect(dayPlan(pack, new Map(), at(8)).daysLeft).toBe(4);
  });

  it('counts lessons offered today as done', () => {
    const states = withLessons(1, 1, 7);
    const p = dayPlan(pack, states, at(7, 18));
    expect(p.lessonsToday.map((l) => l.id)).toEqual(['l1', 'l2']);
    expect(p.doneToday.map((l) => l.id)).toEqual(['l1']);
  });

  it('a skipped day gives a bigger goal', () => {
    // Lessons 1-2 on Wednesday, nothing on Thursday; on Friday 5 lessons remain over 2 study days.
    const states = withLessons(2, 2, 7);
    const p = dayPlan(pack, states, at(9));
    expect(p.daysLeft).toBe(3);
    expect(p.lessonsToday.map((l) => l.id)).toEqual(['l3', 'l4', 'l5']);
  });

  it('the day before the test is for review', () => {
    const p = dayPlan(pack, withLessons(7, 2, 9), at(11));
    expect(p.reviewDay).toBe(true);
    expect(p.lessonsToday).toEqual([]);
  });
});

describe('practice test answers', () => {
  const testAnswer = (id: string, correct: boolean) => ({
    items: { [id]: correct }, ms: 3000, fast: false, at: at(10), mode: 'test' as const, sessionId: 't',
  });

  it('do not start a lesson', () => {
    const states = replay([testAnswer('mean:payer:nl2fr', true), testAnswer('pc:rule', true)]);
    expect(nextLesson(pack, states)!.id).toBe('l1');
  });

  it('wrong ones come back in the next session', () => {
    const states = replay([testAnswer('pc:aux:vous', false)]);
    expect(candidateItems(pack, states, at(10, 12))).toContain('pc:aux:vous');
  });
});

describe('vocabulary trainer keeps the grammar path intact', () => {
  const typed = (ids: string[], day = 8) => ids.map((id, k) => ({
    items: { [id]: true }, ms: 3000, fast: false, at: at(day) + k, mode: 'type' as const, sessionId: 'v',
  }));
  const vocabOf = (part: string) => pack.vocab.filter((w) => w.part === part)
    .flatMap((w) => [`voc:${w.id}:fr2nl`, `voc:${w.id}:nl2fr`]);

  it('words of part A do not start lesson 1', () => {
    const states = replay(typed(vocabOf('A')));
    expect(nextLesson(pack, states)!.id).toBe('l1');
    expect(dayPlan(pack, states, at(8, 18)).doneToday).toEqual([]);
  });

  it('words of part F start lesson 7, which has only words', () => {
    const states = replay(typed(vocabOf('F')));
    const l7 = pack.lessons.find((l) => l.id === 'l7')!;
    expect(dayPlan(pack, states, at(8, 18)).lessonsToday.length).toBeGreaterThan(0);
    expect(nextLesson(pack, states)!.id).toBe('l1');
    expect(introducedLessons(pack, states)).toEqual([l7]);
  });
});
