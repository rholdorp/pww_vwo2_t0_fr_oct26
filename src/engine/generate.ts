// Builds a question for an item, with the question form matching its level
// (practice-sessions: "Vraagvorm groeit mee met het niveau").

import { withJe } from '../content/conjugate';
import { itemId } from '../content/items';
import type { ContentPack, IrregularVerb, Person, RegularVerb, Tense, VocabItem } from '../content/types';
import { PERSONS } from '../content/types';
import { displayAnswer } from './check';
import type { ItemState } from './mastery';
import { levelOf } from './mastery';
import type { FormQuestion, Mode, Question } from './question';
import { formItem, isRegular } from './question';

export type Rng = () => number;

export interface GenContext {
  pack: ContentPack;
  states: Map<string, ItemState>;
  rng: Rng;
  /** Regular verbs whose lesson has been offered; used for ending and pc drills. */
  knownVerbs: RegularVerb[];
}

export function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let counter = 0;
const newKey = () => `q${++counter}`;

/** Question for an item, or undefined when the id is unknown. */
export function questionFor(id: string, ctx: GenContext, forceMode?: Mode): Question | undefined {
  const { pack, states, rng } = ctx;
  const level = levelOf(states, id);
  const mode: Mode = forceMode ?? (level === 0 ? 'mc' : 'type');
  const parts = id.split(':');
  const regular = (vid: string) => pack.regularVerbs.find((v) => v.id === vid);
  const irregular = (vid: string) => pack.irregularVerbs.find((v) => v.id === vid);
  let q: Question | undefined;

  switch (parts[0]) {
    case 'voc': {
      const word = pack.vocab.find((w) => w.id === parts[1]);
      if (word) q = { key: newKey(), mode, kind: 'vocab', word, dir: parts[2] as 'fr2nl' | 'nl2fr' };
      break;
    }
    case 'mean': {
      const verb = regular(parts[1]);
      if (verb) q = { key: newKey(), mode, kind: 'meaning', verb, dir: parts[2] as 'fr2nl' | 'nl2fr' };
      break;
    }
    case 'end': {
      const p = parts[2] as Person;
      const verbs = ctx.knownVerbs.filter((v) => !v.presOverrides?.[p]);
      const verb = pick(verbs.length ? verbs : pack.regularVerbs.filter((v) => !v.presOverrides?.[p]), rng);
      q = formQuestion(verb, 'pres', p, mode, ctx);
      break;
    }
    case 'spell': {
      const verb = regular(parts[1]);
      if (verb) q = formQuestion(verb, 'pres', parts[2] as Person, mode, ctx);
      break;
    }
    case 'irr': {
      const verb = irregular(parts[2]);
      if (verb) q = formQuestion(verb, 'pres', parts[3] as Person, mode, ctx);
      break;
    }
    case 'pc': {
      const pcVerbs = ctx.knownVerbs.filter((v) => !v.noPC);
      const anyVerb = () => pick(pcVerbs.length ? pcVerbs : pack.regularVerbs.filter((v) => !v.noPC), rng);
      if (parts[1] === 'rule') q = formQuestion(anyVerb(), 'pc', pick(PERSONS, rng), mode, ctx);
      else if (parts[1] === 'aux') q = formQuestion(anyVerb(), 'pc', parts[2] as Person, mode, ctx);
      else if (parts[1] === 'part') {
        const verb = irregular(parts[2]);
        if (verb) q = formQuestion(verb, 'pc', pick(PERSONS, rng), mode, ctx);
      }
      break;
    }
  }
  if (q && q.mode === 'mc') q.options = optionsFor(q, ctx);
  return q;
}

/**
 * Drill ("donner · nous") until the items are on level 2; then a test
 * sentence like "Les filles (geven)".
 */
function formQuestion(
  verb: RegularVerb | IrregularVerb, tense: Tense, person: Person, mode: Mode, ctx: GenContext,
): FormQuestion {
  const { states, pack, rng } = ctx;
  const main = tense === 'pres'
    ? formItem(verb, person)
    : isRegular(verb) ? itemId.pcRule() : itemId.participle(verb);
  const others = tense === 'pc' ? [itemId.aux(person)] : [];
  const meaning = isRegular(verb) ? [itemId.meaning(verb, 'nl2fr')] : [];
  const ready = [main, ...others, ...meaning].every((id) => levelOf(states, id) >= 2);
  const sentence = mode === 'type' && ready;
  return {
    key: newKey(),
    mode,
    kind: 'form',
    tense,
    verb,
    person,
    subject: sentence ? pick(pack.subjects.filter((s) => s.person === person), rng) : undefined,
    dutchPrompt: sentence,
  };
}

function optionsFor(q: Question, ctx: GenContext): string[] {
  const { pack, rng } = ctx;
  const answer = displayAnswer(q);
  let pool: string[] = [];
  switch (q.kind) {
    case 'vocab': {
      const same = pack.vocab.filter((w) => w.part === q.word.part && w.id !== q.word.id);
      pool = same.map((w: VocabItem) => (q.dir === 'nl2fr' ? w.fr : w.nl));
      break;
    }
    case 'meaning':
      pool = pack.regularVerbs.filter((v) => v.id !== q.verb.id).map((v) => (q.dir === 'nl2fr' ? v.inf : v.nl.join(', ')));
      break;
    case 'form':
      pool = PERSONS.filter((p) => p !== q.person).map((p) => displayAnswer({ ...q, person: p }));
      if (q.person === 'je') {
        // Same style as the answer (with je/j'), plus the wrong elision as a tempting option.
        pool = pool.map(withJe);
        pool.push(answer.startsWith("j'") ? `je ${answer.slice(2)}` : `j'${answer.slice(3)}`);
      }
      break;
  }
  const distractors = shuffle([...new Set(pool)].filter((o) => o !== answer), rng).slice(0, 3);
  return shuffle([answer, ...distractors], rng);
}
