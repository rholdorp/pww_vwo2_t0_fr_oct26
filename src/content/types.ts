// Types for a content pack: all study material for one test (design D2).

export type Person = 'je' | 'tu' | 'il' | 'nous' | 'vous' | 'ils';
export const PERSONS: Person[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

/** How each person is shown in tables and questions. */
export const PERSON_LABEL: Record<Person, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle/on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

export type Tense = 'pres' | 'pc';
export type Block = 1 | 2 | 3;
export type VocabPart = 'A' | 'B' | 'E' | 'F';

/** A regular -er verb from the list the student must know by heart. */
export interface RegularVerb {
  /** Infinitive without accents, used in item ids, e.g. "preferer". */
  id: string;
  /** Number in the teacher's list (1-25). */
  nr: number;
  inf: string;
  /** Dutch meanings as written in the book, e.g. "kijken naar". */
  nl: string[];
  /** Dutch label used in test sentences like "Nous (kopen)". */
  nlPrompt: string;
  /** Starts with a vowel or mute h, so "je" becomes "j'". */
  elide: boolean;
  /**
   * Present-tense forms that differ from stem + ending. Each person may list
   * several accepted spellings; the first one is shown as the model answer.
   */
  presOverrides?: Partial<Record<Person, string[]>>;
  /** Not asked in the passé composé (verbs that take être). */
  noPC?: boolean;
}

/** être, avoir, faire, aller: forms learned by heart. */
export interface IrregularVerb {
  id: 'etre' | 'avoir' | 'faire' | 'aller';
  inf: string;
  nl: string[];
  nlPrompt: string;
  elide: boolean;
  pres: Record<Person, string>;
  /** Past participle; absent when the passé composé is not part of the test. */
  participle?: string;
}

export interface VocabItem {
  /** Stable id, e.g. "A-la-rentree". */
  id: string;
  part: VocabPart;
  /** French as printed in the book, e.g. "l'ami(e)", "le/la jeune". */
  fr: string;
  /** Gender marker printed after the word ("m", "v", "m mv"), display only. */
  gender?: string;
  /** Dutch as printed in the book, e.g. "in het begin, eerst". */
  nl: string;
}

export interface Explanation {
  id: string;
  title: string;
  paragraphs: string[];
  /** Optional two-column table, e.g. person + form. */
  table?: [string, string][];
  /** Points to watch, shown as a list. */
  tips?: string[];
}

/** Subject used in test sentences, e.g. "Les filles" -> ils. */
export interface Subject {
  label: string;
  person: Person;
}

export interface Lesson {
  id: string;
  title: string;
  explanationIds: string[];
  /** Ids of all items introduced in this lesson (see items.ts). */
  itemIds: string[];
}

export interface ContentPack {
  id: string;
  title: string;
  /** ISO date of the test, e.g. "2026-10-12". */
  testDate: string;
  regularVerbs: RegularVerb[];
  irregularVerbs: IrregularVerb[];
  vocab: VocabItem[];
  explanations: Explanation[];
  subjects: Subject[];
  lessons: Lesson[];
}
