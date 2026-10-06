import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { pack } from '../content/pww-oct26';
import type { Lesson } from '../content/types';
import type { CheckResult } from '../engine/check';
import { questionFor } from '../engine/generate';
import type { Question } from '../engine/question';
import { itemId } from '../content/items';
import {
  candidateItems, nextLesson, pickNextItem, readyForNewLesson, ReaskQueue, SESSION_MS,
} from '../engine/session';
import { LessonView } from './LessonView';
import { QuestionView } from './QuestionView';
import type { Learner } from './useLearner';
import { newSessionId } from './useLearner';

interface Props {
  learner: Learner;
  /** Start with the next lesson even below the 80% threshold. */
  forceLesson: boolean;
  onDone: () => void;
}

interface Asked {
  q: Question;
  itemId: string;
  correct?: boolean;
}

export function Session({ learner, forceLesson, onDone }: Props) {
  const sessionId = useMemo(newSessionId, []);
  const startedAt = useRef(Date.now());
  const reask = useRef(new ReaskQueue());
  const [lesson, setLesson] = useState<Lesson | undefined>(() =>
    forceLesson || readyForNewLesson(pack, learner.states) ? nextLesson(pack, learner.states) : undefined,
  );
  const [history, setHistory] = useState<Asked[]>([]);
  const [current, setCurrent] = useState<Asked>();
  const [finished, setFinished] = useState(false);
  const [extraRound, setExtraRound] = useState(0);
  // Latest data, also inside callbacks that were created before a re-render.
  const latest = useRef(learner);
  latest.current = learner;
  // Lessons opened in this session count as offered even before their first answer.
  const opened = useRef<Lesson[]>(lesson ? [lesson] : []);

  const nextQuestion = (asked: Asked[]): Asked | undefined => {
    const states = latest.current.states;
    const candidates = [...new Set([...candidateItems(pack, states), ...opened.current.flatMap((l) => l.itemIds)])];
    const known = pack.regularVerbs.filter((v) => candidates.includes(itemId.meaning(v, 'nl2fr')));
    if (!candidates.length) return undefined;
    const recent = asked.map((a) => a.itemId);
    const id = reask.current.due(asked.length) ?? pickNextItem(candidates, states, recent, Date.now(), Math.random);
    if (!id) return undefined;
    const q = questionFor(id, { pack, states, rng: Math.random, knownVerbs: known });
    return q && { q, itemId: id };
  };

  // Without a new lesson the session starts with questions right away.
  useEffect(() => {
    if (!lesson) setCurrent(nextQuestion([]));
  }, []);

  const startQuestions = () => {
    setLesson(undefined);
    setCurrent(nextQuestion(history));
  };

  const onAnswered = (r: CheckResult, ms: number) => {
    if (!current) return;
    learner.record(current.q, r, ms, current.q.mode, sessionId);
    if (!r.correct) reask.current.add(current.itemId, history.length + 1, Math.random);
    setCurrent({ ...current, correct: r.correct });
  };

  const onNext = () => {
    const asked = current ? [...history, current] : history;
    setHistory(asked);
    const limit = SESSION_MS * (extraRound + 1);
    if (Date.now() - startedAt.current >= limit) {
      setCurrent(undefined);
      setFinished(true);
      return;
    }
    setCurrent(nextQuestion(asked));
  };

  if (lesson) {
    return (
      <main class="page">
        <button class="link" onClick={onDone}>← Dashboard</button>
        <LessonView
          lesson={lesson}
          onRecord={(q, r) => learner.record(q, r, undefined, 'type', sessionId)}
          onDone={startQuestions}
        />
      </main>
    );
  }

  if (finished || (!current && history.length > 0)) {
    const good = history.filter((a) => a.correct).length;
    const minutes = Math.round((Date.now() - startedAt.current) / 60000);
    return (
      <main class="page">
        <h1>Sessie klaar</h1>
        <div class="card stack">
          <div class="big-number">{good} / {history.length}</div>
          <p>goed in {minutes} {minutes === 1 ? 'minuut' : 'minuten'}.</p>
          {reask.current.size > 0 && <p class="muted">Een paar fouten komen in de volgende sessie terug.</p>}
        </div>
        <button
          class="primary full"
          onClick={() => {
            setFinished(false);
            setExtraRound((n) => n + 1);
            setCurrent(nextQuestion(history));
          }}
        >
          Nog even doorgaan
        </button>
        <button class="full" onClick={onDone}>Klaar, naar het dashboard</button>
      </main>
    );
  }

  if (!current) {
    return (
      <main class="page">
        <p class="muted">Er is nog niets om te oefenen.</p>
        <button class="primary full" onClick={onDone}>Terug</button>
      </main>
    );
  }

  return (
    <main class="page">
      <div class="row spread">
        <button class="link" onClick={() => setFinished(true)}>Stoppen</button>
        <span class="muted">vraag {history.length + 1}</span>
      </div>
      <QuestionView question={current.q} onAnswered={onAnswered} onNext={onNext} />
    </main>
  );
}
