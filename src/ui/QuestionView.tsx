import { useEffect, useRef, useState } from 'preact/hooks';
import { pack } from '../content/pww-oct26';
import { PERSON_LABEL } from '../content/types';
import type { CheckResult } from '../engine/check';
import { check } from '../engine/check';
import { hintText } from '../engine/hints';
import type { Question } from '../engine/question';

const ACCENTS = ['é', 'è', 'ê', 'à', 'ç', "'"];

/** Inserts a character at the cursor without closing the phone keyboard. */
export function AccentBar({ target, onChange }: { target: () => HTMLInputElement | null; onChange: (v: string) => void }) {
  const insert = (ch: string) => {
    const el = target();
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const value = el.value.slice(0, start) + ch + el.value.slice(end);
    el.value = value;
    el.setSelectionRange(start + ch.length, start + ch.length);
    onChange(value);
  };
  return (
    <div class="accents" aria-label="Accenten">
      {ACCENTS.map((ch) => (
        <button
          type="button"
          key={ch}
          // pointerdown + preventDefault keeps the focus (and the keyboard) in the input.
          onPointerDown={(e) => {
            e.preventDefault();
            insert(ch);
          }}
          onClick={(e) => e.preventDefault()}
        >
          {ch}
        </button>
      ))}
    </div>
  );
}

export function questionLabel(q: Question): { instruction: string; prompt: string; frenchAnswer: boolean } {
  switch (q.kind) {
    case 'vocab':
      return q.dir === 'nl2fr'
        ? { instruction: 'Vertaal naar het Frans', prompt: q.word.nl, frenchAnswer: true }
        : { instruction: 'Vertaal naar het Nederlands', prompt: q.word.fr, frenchAnswer: false };
    case 'meaning':
      return q.dir === 'nl2fr'
        ? { instruction: 'Welk Frans werkwoord is dit?', prompt: q.verb.nlPrompt, frenchAnswer: true }
        : { instruction: 'Wat betekent dit werkwoord?', prompt: q.verb.inf, frenchAnswer: false };
    case 'form': {
      const tense = q.tense === 'pres' ? 'présent' : 'passé composé';
      if (q.dutchPrompt && q.subject) {
        const subject = q.person === 'je' ? "Je / J'" : q.subject.label;
        return { instruction: `Vul in · ${tense}`, prompt: `${subject} (${q.verb.nlPrompt})`, frenchAnswer: true };
      }
      return { instruction: `Vervoeg · ${tense}`, prompt: `${q.verb.inf} · ${PERSON_LABEL[q.person]}`, frenchAnswer: true };
    }
  }
}

function placeholder(q: Question): string {
  if (q.kind === 'form' && q.person === 'je') return "je ... / j' ...";
  if (q.kind === 'form' && q.tense === 'pc') return 'hulpwerkwoord + voltooid deelwoord';
  return 'Typ je antwoord';
}

export function Feedback({ result }: { result: CheckResult }) {
  if (result.correct) return <div class="feedback good">Goed!</div>;
  return (
    <div class="feedback bad">
      <div>
        Het juiste antwoord is{' '}
        <span class="answer">
          {result.diff.map((d, i) => <span key={i} class={d.ok ? '' : 'diff-bad'}>{d.text}</span>)}
        </span>
      </div>
      {result.hint && <div class="muted">{hintText(result.hint)}</div>}
    </div>
  );
}

interface Props {
  question: Question;
  /** Called once with the result and the time it took. */
  onAnswered: (result: CheckResult, ms: number) => void;
  onNext: () => void;
  /** Practice test: no feedback, go straight to the next question. */
  silent?: boolean;
}

export function QuestionView({ question: q, onAnswered, onNext, silent }: Props) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<CheckResult>();
  const shownAt = useRef(performance.now());
  const input = useRef<HTMLInputElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const label = questionLabel(q);

  useEffect(() => {
    setValue('');
    setResult(undefined);
    shownAt.current = performance.now();
    input.current?.focus();
  }, [q.key]);

  useEffect(() => {
    if (!result) return;
    if (result.correct) {
      const t = setTimeout(onNext, 700);
      return () => clearTimeout(t);
    }
    nextBtn.current?.focus();
  }, [result]);

  const submit = (answer: string) => {
    if (result) return;
    if (q.mode === 'type' && !answer.trim()) return;
    const ms = performance.now() - shownAt.current;
    const r = check(q, answer, pack.regularVerbs);
    onAnswered(r, ms);
    if (silent) onNext();
    else setResult(r);
  };

  return (
    <div class="card stack">
      <div class="muted">{label.instruction}</div>
      <div class="prompt">{label.prompt}</div>

      {q.mode === 'mc' ? (
        <div class="choices">
          {q.options!.map((o) => {
            const state = result && (o === result.model ? 'good' : o === value ? 'bad' : '');
            return (
              <button
                key={o}
                class={`choice ${state ?? ''}`}
                disabled={!!result}
                onClick={() => {
                  setValue(o);
                  submit(o);
                }}
              >
                {o}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          class="stack"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <input
            ref={input}
            type="text"
            class={result ? (result.correct ? 'good' : 'bad') : ''}
            value={value}
            readOnly={!!result}
            placeholder={placeholder(q)}
            onInput={(e) => setValue((e.target as HTMLInputElement).value)}
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck={false}
            enterkeyhint="done"
            lang={label.frenchAnswer ? 'fr' : 'nl'}
            aria-label="Antwoord"
          />
          {label.frenchAnswer && !result && <AccentBar target={() => input.current} onChange={setValue} />}
          {!result && <button class="primary full" type="submit">Controleer</button>}
        </form>
      )}

      {result && <Feedback result={result} />}
      {result && !result.correct && (
        <button ref={nextBtn} class="primary full" onClick={onNext}>Verder</button>
      )}
    </div>
  );
}
