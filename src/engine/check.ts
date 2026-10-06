// Checking answers and diagnosing which sub-skill went wrong (design D4).

import { itemId } from '../content/items';
import {
  avoirPres, elidesBefore, irregularPc, irregularPres, regularPc, regularPres, stemOf, withJe,
} from '../content/conjugate';
import type { IrregularVerb, Person, RegularVerb } from '../content/types';
import type { FormQuestion, Question } from './question';
import { formItem, isRegular, questionItems } from './question';
import type { DiffPart } from './text';
import {
  diffAgainstModel, expandPhrase, hasFrenchArticle, normalize, stripAccents, stripDutchArticle,
  stripFrenchArticle,
} from './text';

export type Hint =
  | { key: 'accent' }
  | { key: 'article' }
  | { key: 'elision'; shouldElide: boolean }
  | { key: 'no-pronoun' }
  | { key: 'wrong-pronoun'; person: Person }
  | { key: 'ending'; person: Person }
  | { key: 'spelling'; verb: RegularVerb; person: Person }
  | { key: 'irregular'; verb: IrregularVerb }
  | { key: 'aux'; person: Person }
  | { key: 'participle-rule' }
  | { key: 'participle'; verb: IrregularVerb }
  | { key: 'meaning'; verb: RegularVerb };

export interface CheckResult {
  correct: boolean;
  /** Outcome per involved item; items that could not be judged are left out. */
  perItem: Record<string, boolean>;
  /** Model answer closest to what the student typed. */
  model: string;
  /** Model answer with wrong/missing characters marked; empty when correct. */
  diff: DiffPart[];
  hint?: Hint;
}

/** The answer as shown in multiple-choice options and summaries. */
export function displayAnswer(q: Question): string {
  switch (q.kind) {
    case 'vocab':
      return q.dir === 'nl2fr' ? q.word.fr : q.word.nl;
    case 'meaning':
      return q.dir === 'nl2fr' ? q.verb.inf : q.verb.nl.join(', ');
    case 'form':
      return expectedForms(q)[0];
  }
}

/** Accepted full answers of a form question (with pronoun for je). */
export function expectedForms(q: FormQuestion): string[] {
  const forms = verbForms(q.verb, q.tense, q.person);
  return q.person === 'je' ? forms.map(withJe) : forms;
}

function verbForms(verb: RegularVerb | IrregularVerb, tense: 'pres' | 'pc', p: Person): string[] {
  if (tense === 'pres') return isRegular(verb) ? regularPres(verb, p) : [irregularPres(verb, p)];
  const f = isRegular(verb) ? regularPc(verb, p) : irregularPc(verb, p);
  return [`${f.aux} ${f.participle}`];
}

export function check(q: Question, rawAnswer: string, allVerbs: RegularVerb[] = []): CheckResult {
  if (q.mode === 'mc') return checkChoice(q, rawAnswer);
  switch (q.kind) {
    case 'vocab':
      return q.dir === 'nl2fr'
        ? checkFrench(questionItems(q), expandPhrase(q.word.fr), rawAnswer)
        : checkDutch(questionItems(q), expandPhrase(q.word.nl), rawAnswer);
    case 'meaning':
      return q.dir === 'nl2fr'
        ? checkFrench(questionItems(q), [normalize(q.verb.inf)], rawAnswer)
        : checkDutch(questionItems(q), q.verb.nl.flatMap(expandPhrase), rawAnswer);
    case 'form':
      return checkForm(q, rawAnswer, allVerbs);
  }
}

function checkChoice(q: Question, answer: string): CheckResult {
  const model = displayAnswer(q);
  const correct = answer === model;
  return {
    correct,
    perItem: Object.fromEntries(questionItems(q).map((id) => [id, correct])),
    model,
    diff: correct ? [] : [{ text: model, ok: false }],
  };
}

function closest(answer: string, accepted: string[]): string {
  let best = accepted[0];
  let bestScore = -1;
  for (const a of accepted) {
    const score = diffAgainstModel(answer, a).filter((d) => d.ok).reduce((n, d) => n + d.text.length, 0)
      - Math.abs(a.length - answer.length) / 100;
    if (score > bestScore) {
      best = a;
      bestScore = score;
    }
  }
  return best;
}

function result(items: string[], correct: boolean, answer: string, accepted: string[], hint?: Hint): CheckResult {
  const model = correct ? answer : closest(answer, accepted);
  return {
    correct,
    perItem: Object.fromEntries(items.map((id) => [id, correct])),
    model,
    diff: correct ? [] : diffAgainstModel(answer, model),
    hint: correct ? undefined : hint,
  };
}

/** French answers: accents and articles count. */
function checkFrench(items: string[], accepted: string[], raw: string): CheckResult {
  const answer = normalize(raw);
  if (accepted.includes(answer)) return result(items, true, answer, accepted);
  const loose = stripAccents(answer);
  let hint: Hint | undefined;
  if (accepted.some((a) => stripAccents(a) === loose)) hint = { key: 'accent' };
  else if (accepted.some((a) => hasFrenchArticle(a) && stripAccents(stripFrenchArticle(a)) === loose)) {
    hint = { key: 'article' };
  }
  return result(items, false, answer, accepted, hint);
}

/** Dutch answers: any meaning, article and parenthesised parts optional, accents ignored. */
function checkDutch(items: string[], accepted: string[], raw: string): CheckResult {
  const answer = normalize(raw);
  const soft = (s: string) => stripAccents(stripDutchArticle(s));
  const correct = accepted.some((a) => soft(a) === soft(answer));
  return result(items, correct, answer, accepted);
}

const PRONOUNS: Record<Person, string[]> = {
  je: ['je'],
  tu: ['tu'],
  il: ['il', 'elle', 'on'],
  nous: ['nous'],
  vous: ['vous'],
  ils: ['ils', 'elles'],
};
const ALL_PRONOUNS = Object.values(PRONOUNS).flat();

interface Parsed {
  rest: string;
  pronounOk: boolean;
  hint?: Hint;
}

function parsePronoun(answer: string, p: Person, firstWord: string): Parsed {
  if (p === 'je') {
    const m = answer.match(/^(je |j')(.*)$/);
    if (!m) return { rest: answer, pronounOk: false, hint: { key: 'no-pronoun' } };
    const shouldElide = elidesBefore(firstWord);
    const ok = (m[1] === "j'") === shouldElide;
    return { rest: m[2].trim(), pronounOk: ok, hint: ok ? undefined : { key: 'elision', shouldElide } };
  }
  const m = answer.match(/^(\S+) (.*)$/);
  if (m && ALL_PRONOUNS.includes(m[1])) {
    const ok = PRONOUNS[p].includes(m[1]);
    return { rest: m[2], pronounOk: ok, hint: ok ? undefined : { key: 'wrong-pronoun', person: p } };
  }
  return { rest: answer, pronounOk: true };
}

/** Which of the verbs a typed form most likely belongs to (longest matching stem prefix). */
export function identifyVerb(form: string, expected: RegularVerb, allVerbs: RegularVerb[]): RegularVerb | undefined {
  const word = stripAccents(form);
  let best: RegularVerb | undefined;
  let bestLen = 0;
  for (const v of allVerbs.length ? allVerbs : [expected]) {
    const stem = stripAccents(stemOf(v.inf));
    const len = word.startsWith(stem) ? stem.length : word.startsWith(stem.slice(0, -1)) ? stem.length - 1 : 0;
    if (len >= 2 && (len > bestLen || (len === bestLen && v === expected))) {
      best = v;
      bestLen = len;
    }
  }
  return best;
}

function checkForm(q: FormQuestion, raw: string, allVerbs: RegularVerb[]): CheckResult {
  const answer = normalize(raw);
  const forms = verbForms(q.verb, q.tense, q.person);
  const accepted = expectedForms(q);
  const parsed = parsePronoun(answer, q.person, forms[0]);
  const formOk = forms.includes(parsed.rest);
  const correct = formOk && parsed.pronounOk;
  const perItem: Record<string, boolean> = {};
  const meaningId = q.dutchPrompt && isRegular(q.verb) ? itemId.meaning(q.verb, 'nl2fr') : undefined;
  let hint: Hint | undefined = parsed.hint;

  if (q.tense === 'pres') {
    const fItem = formItem(q.verb, q.person);
    if (formOk) {
      perItem[fItem] = parsed.pronounOk;
      if (meaningId) perItem[meaningId] = true;
    } else {
      const same = isRegular(q.verb) ? identifyVerb(parsed.rest, q.verb, allVerbs) : undefined;
      if (meaningId) perItem[meaningId] = same === q.verb;
      if (!meaningId || same === q.verb) perItem[fItem] = false;
      if (meaningId && same !== q.verb) hint = { key: 'meaning', verb: q.verb as RegularVerb };
      else hint ??= formHint(q, parsed.rest, forms);
    }
  } else {
    const [aux, ...partWords] = parsed.rest.split(' ');
    const part = partWords.join(' ');
    const f = isRegular(q.verb) ? regularPc(q.verb, q.person) : irregularPc(q.verb as IrregularVerb, q.person);
    const auxOk = aux === avoirPres(q.person) && parsed.pronounOk;
    const partOk = part === f.participle;
    const partItem = isRegular(q.verb) ? itemId.pcRule() : itemId.participle(q.verb);
    perItem[itemId.aux(q.person)] = auxOk;
    const same = isRegular(q.verb) && !partOk ? identifyVerb(part, q.verb, allVerbs) : q.verb;
    if (meaningId) perItem[meaningId] = same === q.verb;
    if (!meaningId || same === q.verb) perItem[partItem] = partOk;
    if (!correct && !hint) {
      if (meaningId && same !== q.verb) hint = { key: 'meaning', verb: q.verb as RegularVerb };
      else if (!auxOk) hint = { key: 'aux', person: q.person };
      else if (stripAccents(part) === stripAccents(f.participle)) hint = { key: 'accent' };
      else hint = isRegular(q.verb) ? { key: 'participle-rule' } : { key: 'participle', verb: q.verb };
    }
  }

  const model = correct ? answer : closest(answer, accepted);
  return { correct, perItem, model, diff: correct ? [] : diffAgainstModel(answer, model), hint: correct ? undefined : hint };
}

function formHint(q: FormQuestion, rest: string, forms: string[]): Hint {
  if (forms.some((f) => stripAccents(f) === stripAccents(rest))) {
    if (isRegular(q.verb) && q.verb.presOverrides?.[q.person]) return { key: 'spelling', verb: q.verb, person: q.person };
    return { key: 'accent' };
  }
  if (!isRegular(q.verb)) return { key: 'irregular', verb: q.verb };
  if (q.verb.presOverrides?.[q.person]) return { key: 'spelling', verb: q.verb, person: q.person };
  return { key: 'ending', person: q.person };
}
