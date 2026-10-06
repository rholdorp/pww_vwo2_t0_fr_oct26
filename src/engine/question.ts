// Question model shared by the checker, sessions and the practice test.

import type { Direction } from '../content/items';
import { itemId, spellingPersons } from '../content/items';
import type { IrregularVerb, Person, RegularVerb, Subject, Tense, VocabItem } from '../content/types';

export type Mode = 'mc' | 'type';

interface Base {
  /** Unique within a session, used for re-asking. */
  key: string;
  mode: Mode;
  /** Options for multiple choice (includes the right answer). */
  options?: string[];
}

/** Vocabulary word, one direction. */
export interface VocabQuestion extends Base {
  kind: 'vocab';
  word: VocabItem;
  dir: Direction;
}

/** Meaning of a regular verb, one direction. */
export interface MeaningQuestion extends Base {
  kind: 'meaning';
  verb: RegularVerb;
  dir: Direction;
}

/**
 * Conjugate a verb. With `subject` and `dutchPrompt` it is a test sentence
 * like "Les filles (geven)"; otherwise a drill like "donner · nous".
 */
export interface FormQuestion extends Base {
  kind: 'form';
  tense: Tense;
  verb: RegularVerb | IrregularVerb;
  person: Person;
  subject?: Subject;
  /** Show the Dutch meaning instead of the infinitive (test sentence). */
  dutchPrompt: boolean;
}

export type Question = VocabQuestion | MeaningQuestion | FormQuestion;

export function isRegular(v: RegularVerb | IrregularVerb): v is RegularVerb {
  return 'nr' in v;
}

/** Item that a conjugated form counts for (ending, spelling or irregular form). */
export function formItem(verb: RegularVerb | IrregularVerb, p: Person): string {
  if (!isRegular(verb)) return itemId.irregular(verb, p);
  return spellingPersons(verb).includes(p) ? itemId.spelling(verb, p) : itemId.ending(p);
}

/** Items involved in a question (design D3). */
export function questionItems(q: Question): string[] {
  switch (q.kind) {
    case 'vocab':
      return [itemId.vocab(q.word, q.dir)];
    case 'meaning':
      return [itemId.meaning(q.verb, q.dir)];
    case 'form': {
      const meaning = q.dutchPrompt && isRegular(q.verb) ? [itemId.meaning(q.verb, 'nl2fr')] : [];
      if (q.tense === 'pres') return [...meaning, formItem(q.verb, q.person)];
      const part = isRegular(q.verb) ? itemId.pcRule() : itemId.participle(q.verb);
      return [...meaning, itemId.aux(q.person), part];
    }
  }
}
