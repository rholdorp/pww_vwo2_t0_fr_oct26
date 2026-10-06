import { useRef, useState } from 'preact/hooks';
import { pack } from '../content/pww-oct26';
import type { Explanation, Lesson, Tense } from '../content/types';
import { PERSONS, PERSON_LABEL } from '../content/types';
import type { CheckResult } from '../engine/check';
import { check } from '../engine/check';
import type { FormQuestion } from '../engine/question';
import { AccentBar, Feedback } from './QuestionView';

function ExplanationCard({ e }: { e: Explanation }) {
  return (
    <section class="card stack">
      <h2>{e.title}</h2>
      {e.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      {e.table && (
        <table class="conj">
          <tbody>
            {e.table.map(([a, b], i) => (
              <tr key={i}><td>{a}</td><td>{b}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {e.tips && (
        <ul>
          {e.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </section>
  );
}

function WordList({ lesson }: { lesson: Lesson }) {
  const ids = new Set(lesson.itemIds.filter((id) => id.startsWith('voc:')).map((id) => id.split(':')[1]));
  const words = pack.vocab.filter((w) => ids.has(w.id));
  if (!words.length) return null;
  return (
    <section class="card stack">
      <h2>Nieuwe woorden</h2>
      <p class="muted">Lees ze rustig door, hardop als het kan. Daarna ga je ze oefenen.</p>
      <table class="conj">
        <tbody>
          {words.map((w) => (
            <tr key={w.id}>
              <td style={{ color: 'var(--text)', fontWeight: 600 }}>{w.fr}{w.gender ? ` (${w.gender})` : ''}</td>
              <td>{w.nl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const verbById = (id: string) => pack.regularVerbs.find((v) => v.id === id) ?? pack.irregularVerbs.find((v) => v.id === id)!;

/** Fill-in table like in the draaiboek: six persons of one verb. */
function FillTable({ verbId, tense, onChecked }: {
  verbId: string;
  tense: Tense;
  onChecked: (results: { q: FormQuestion; r: CheckResult }[]) => void;
}) {
  const verb = verbById(verbId);
  const [values, setValues] = useState<string[]>(PERSONS.map(() => ''));
  const [results, setResults] = useState<CheckResult[]>();
  const [focused, setFocused] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const questions: FormQuestion[] = PERSONS.map((p) => ({
    key: `${verbId}-${tense}-${p}`, mode: 'type', kind: 'form', tense, verb, person: p, dutchPrompt: false,
  }));

  const submit = () => {
    const current = inputs.current.map((el, i) => el?.value ?? values[i]);
    const rs = questions.map((q, i) => check(q, current[i], pack.regularVerbs));
    setResults(rs);
    onChecked(questions.map((q, i) => ({ q, r: rs[i] })));
  };

  return (
    <section class="card stack">
      <h2>{verb.inf} = {verb.nlPrompt} · {tense === 'pres' ? 'présent' : 'passé composé'}</h2>
      <p class="muted">Vul de zes vormen in. Bij je schrijf je je of j' erbij.</p>
      {PERSONS.map((p, i) => (
        <label key={p} class="stack" style={{ gap: '4px' }}>
          <span class="muted">{p === 'je' ? "je / j'" : PERSON_LABEL[p]}</span>
          <input
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            class={results ? (results[i].correct ? 'good' : 'bad') : ''}
            value={values[i]}
            readOnly={!!results}
            onFocus={() => setFocused(i)}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              setValues((prev) => prev.map((x, k) => (k === i ? val : x)));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (i < 5) inputs.current[i + 1]?.focus();
                else submit();
              }
            }}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck={false}
            lang="fr"
            aria-label={PERSON_LABEL[p]}
          />
          {results && !results[i].correct && <Feedback result={results[i]} />}
        </label>
      ))}
      {!results && (
        <>
          <AccentBar
            target={() => inputs.current[focused]}
            onChange={(val) => setValues((prev) => prev.map((x, k) => (k === focused ? val : x)))}
          />
          <button class="primary full" onClick={submit}>Controleer</button>
        </>
      )}
      {results && (
        <p class={`feedback ${results.every((r) => r.correct) ? 'good' : 'bad'}`}>
          {results.filter((r) => r.correct).length} van de 6 goed.
        </p>
      )}
    </section>
  );
}

interface Props {
  lesson: Lesson;
  onRecord: (q: FormQuestion, r: CheckResult) => void;
  onDone: () => void;
}

export function LessonView({ lesson, onRecord, onDone }: Props) {
  const [step, setStep] = useState<'learn' | 'fill'>('learn');
  const [checked, setChecked] = useState(0);
  const explanations = lesson.explanationIds.map((id) => pack.explanations.find((e) => e.id === id)!);

  if (step === 'learn') {
    return (
      <>
        <h1>{lesson.title}</h1>
        {explanations.map((e) => <ExplanationCard key={e.id} e={e} />)}
        <WordList lesson={lesson} />
        <button class="primary full" onClick={() => (lesson.fill.length ? setStep('fill') : onDone())}>
          {lesson.fill.length ? 'Ik heb het gelezen: zelf invullen' : 'Ik heb het gelezen: oefenen'}
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Zelf invullen</h1>
      {lesson.fill.map((f) => (
        <FillTable
          key={`${f.verbId}-${f.tense}`}
          verbId={f.verbId}
          tense={f.tense}
          onChecked={(rs) => {
            rs.forEach(({ q, r }) => onRecord(q, r));
            setChecked((n) => n + 1);
          }}
        />
      ))}
      <button class="link" onClick={() => setStep('learn')}>← Uitleg nog eens bekijken</button>
      <button class="primary full" disabled={checked < lesson.fill.length} onClick={onDone}>Verder met oefenen</button>
    </>
  );
}
