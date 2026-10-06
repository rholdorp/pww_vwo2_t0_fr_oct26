import { useEffect, useMemo, useState } from 'preact/hooks';
import { allItems } from '../content/items';
import { pack } from '../content/pww-oct26';
import type { TestResult } from '../data/store';
import { addAnswer, subscribeAnswers, subscribeTests } from '../data/store';
import type { CheckResult } from '../engine/check';
import type { AnswerMode, AnswerRecord, ItemState, Stats } from '../engine/mastery';
import { computeStats, replay, speedLimit } from '../engine/mastery';
import type { Question } from '../engine/question';

export const ITEMS = allItems(pack);

export interface Learner {
  key: string;
  displayName: string;
  answers: AnswerRecord[];
  states: Map<string, ItemState>;
  stats: Stats;
  tests: TestResult[];
  pending: number;
  loaded: boolean;
  record: (q: Question, r: CheckResult, ms: number | undefined, mode: AnswerMode, sessionId: string) => void;
}

export function useLearner(key: string, displayName: string): Learner {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [pending, setPending] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);

  useEffect(() => {
    const off1 = subscribeAnswers(key, (s) => {
      setAnswers(s.answers);
      setPending(s.pending);
      setLoaded(true);
    });
    const off2 = subscribeTests(key, setTests);
    return () => {
      off1();
      off2();
    };
  }, [key]);

  const states = useMemo(() => replay(answers), [answers]);
  const stats = useMemo(() => computeStats(ITEMS, states), [states]);

  /** `ms` undefined: time not measured (e.g. fill-in tables), never counts as fast. */
  const record = (q: Question, r: CheckResult, ms: number | undefined, mode: AnswerMode, sessionId: string) => {
    if (!Object.keys(r.perItem).length) return;
    addAnswer(key, {
      items: r.perItem,
      ms: Math.round(ms ?? 0),
      fast: r.correct && mode !== 'mc' && ms !== undefined && ms <= speedLimit(q),
      at: Date.now(),
      mode,
      sessionId,
    });
  };

  return { key, displayName, answers, states, stats, tests, pending, loaded, record };
}

export function newSessionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
