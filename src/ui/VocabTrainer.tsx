import { useMemo, useState } from 'preact/hooks';
import { pack } from '../content/pww-oct26';
import type { CheckResult } from '../engine/check';
import type { VocabQuestion } from '../engine/question';
import type { VocabChoice } from '../engine/vocabRound';
import { buildVocabRound } from '../engine/vocabRound';
import { QuestionView } from './QuestionView';
import type { Learner } from './useLearner';
import { newSessionId } from './useLearner';

interface Props {
  learner: Learner;
  choice: VocabChoice;
  onDone: () => void;
}

const fmtTime = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const title = (choice: VocabChoice) => (choice === 'all' ? 'Alle woorden' : `Woorden deel ${choice}`);

/** Vocabulary trainer: 20 word pairs, each once, always typed (vocab-trainer spec). */
export function VocabTrainer({ learner, choice, onDone }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildVocabRound(pack, choice, learner.states, Math.random), [round]);
  const sessionId = useMemo(newSessionId, [round]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ q: VocabQuestion; r: CheckResult }[]>([]);
  const [finishedAt, setFinishedAt] = useState<number>();

  const again = () => {
    setRound((n) => n + 1);
    setIndex(0);
    setResults([]);
    setFinishedAt(undefined);
    setStartedAt(Date.now());
  };

  if (finishedAt) {
    const good = results.filter((x) => x.r.correct).length;
    const wrong = results.filter((x) => !x.r.correct);
    return (
      <main class="page">
        <h1>{title(choice)}</h1>
        <div class="card stack">
          <div class="big-number">{good} / {questions.length}</div>
          <p>in {fmtTime(finishedAt - startedAt)}</p>
        </div>
        {wrong.length > 0 && (
          <section class="card stack">
            <h2>Nog even oefenen</h2>
            <ul class="plain">
              {wrong.map(({ q }) => (
                <li key={q.key}><strong>{q.word.fr}</strong> = {q.word.nl}</li>
              ))}
            </ul>
          </section>
        )}
        <button class="primary full" onClick={again}>Nog een ronde</button>
        <button class="full" onClick={onDone}>Klaar</button>
      </main>
    );
  }

  const q = questions[index];
  return (
    <main class="page">
      <div class="row spread">
        <button class="link" onClick={onDone}>Stoppen</button>
        <span class="muted">{title(choice)} · {index + 1} / {questions.length}</span>
      </div>
      <QuestionView
        question={q}
        onAnswered={(r, ms) => {
          learner.record(q, r, ms, 'type', sessionId);
          setResults((prev) => [...prev, { q, r }]);
        }}
        onNext={() => {
          if (index + 1 >= questions.length) setFinishedAt(Date.now());
          else setIndex(index + 1);
        }}
      />
    </main>
  );
}
