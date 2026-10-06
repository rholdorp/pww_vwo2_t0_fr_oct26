import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { pack } from '../content/pww-oct26';
import { addTestResult } from '../data/store';
import type { CheckResult } from '../engine/check';
import { buildPracticeTest, formatGrade, grade } from '../engine/practiceTest';
import type { Question } from '../engine/question';
import { Feedback, QuestionView, questionLabel } from './QuestionView';
import type { Learner } from './useLearner';
import { newSessionId } from './useLearner';

interface Props {
  learner: Learner;
  onDone: () => void;
}

const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function PracticeTest({ learner, onDone }: Props) {
  const questions = useMemo(() => buildPracticeTest(pack, Math.random), []);
  const sessionId = useMemo(newSessionId, []);
  const [started, setStarted] = useState<number>();
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const results = useRef<{ q: Question; r: CheckResult; answer?: string }[]>([]);
  const [finishedAt, setFinishedAt] = useState<number>();

  useEffect(() => {
    if (!started || finishedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [started, finishedAt]);

  if (!started) {
    return (
      <main class="page">
        <button class="link" onClick={onDone}>← Dashboard</button>
        <h1>Proeftoets</h1>
        <div class="card stack">
          <p>40 vragen zoals op de toets: 10 × -er werkwoorden in de présent, 10 × être/avoir/faire/aller, 10 × passé composé en 10 woorden.</p>
          <p>Je krijgt geen hulp en ziet pas aan het eind wat er goed en fout is. De tijd loopt mee.</p>
          <button class="primary full" onClick={() => setStarted(Date.now())}>Start de proeftoets</button>
        </div>
      </main>
    );
  }

  if (finishedAt) {
    const score = results.current.filter((x) => x.r.correct).length;
    const g = grade(score, questions.length);
    const wrong = results.current.filter((x) => !x.r.correct);
    return (
      <main class="page">
        <h1>Uitslag</h1>
        <div class="card stack">
          <div class="big-number">{formatGrade(g)}</div>
          <p>{score} van de {questions.length} goed in {fmtTime(finishedAt - started)}.</p>
        </div>
        {wrong.length > 0 && <h2>Nabespreking</h2>}
        {wrong.map(({ q, r }) => {
          const label = questionLabel(q);
          return (
            <section key={q.key} class="card stack">
              <div class="muted">{label.instruction}</div>
              <div class="prompt">{label.prompt}</div>
              <Feedback result={r} />
            </section>
          );
        })}
        <button class="primary full" onClick={onDone}>Naar het dashboard</button>
      </main>
    );
  }

  const finish = () => {
    const end = Date.now();
    const score = results.current.filter((x) => x.r.correct).length;
    addTestResult(learner.key, {
      at: end,
      score,
      total: questions.length,
      grade: grade(score, questions.length),
      durationMs: end - started,
    });
    setFinishedAt(end);
  };

  return (
    <main class="page">
      <div class="row spread">
        <span class="muted">vraag {index + 1} van {questions.length}</span>
        <span class="muted">⏱ {fmtTime(now - started)}</span>
      </div>
      <QuestionView
        question={questions[index]}
        silent
        onAnswered={(r, ms) => {
          learner.record(questions[index], r, ms, 'test', sessionId);
          results.current.push({ q: questions[index], r });
        }}
        onNext={() => {
          if (index + 1 >= questions.length) finish();
          else setIndex(index + 1);
        }}
      />
    </main>
  );
}
