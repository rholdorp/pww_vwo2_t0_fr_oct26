// Conjugation of the verbs in the content pack (design D2).
// Regular -er verbs: stem + ending, with per-verb spelling overrides.

import type { IrregularVerb, Person, RegularVerb } from './types';

export const PRES_ENDINGS: Record<Person, string> = {
  je: 'e',
  tu: 'es',
  il: 'e',
  nous: 'ons',
  vous: 'ez',
  ils: 'ent',
};

const AVOIR_PRES: Record<Person, string> = {
  je: 'ai', tu: 'as', il: 'a', nous: 'avons', vous: 'avez', ils: 'ont',
};

export function stemOf(inf: string): string {
  return inf.endsWith('er') ? inf.slice(0, -2) : inf;
}

/** True when "je" becomes "j'" before this form (vowel or mute h). */
export function elidesBefore(form: string): boolean {
  return /^[aeiouhéèêàâîôû]/i.test(form);
}

/** "je" + form, with elision: "j'aime", "je donne". */
export function withJe(form: string): string {
  return elidesBefore(form) ? `j'${form}` : `je ${form}`;
}

/** Accepted present forms of a regular verb (without pronoun); the first is the model. */
export function regularPres(verb: RegularVerb, p: Person): string[] {
  return verb.presOverrides?.[p] ?? [stemOf(verb.inf) + PRES_ENDINGS[p]];
}

export function regularParticiple(verb: RegularVerb): string {
  return stemOf(verb.inf) + 'é';
}

export function avoirPres(p: Person): string {
  return AVOIR_PRES[p];
}

export interface PcForm {
  aux: string;
  participle: string;
}

export function regularPc(verb: RegularVerb, p: Person): PcForm {
  if (verb.noPC) throw new Error(`${verb.inf} is not asked in the passé composé`);
  return { aux: AVOIR_PRES[p], participle: regularParticiple(verb) };
}

export function irregularPres(verb: IrregularVerb, p: Person): string {
  return verb.pres[p];
}

export function irregularPc(verb: IrregularVerb, p: Person): PcForm {
  if (!verb.participle) throw new Error(`${verb.inf} is not asked in the passé composé`);
  return { aux: AVOIR_PRES[p], participle: verb.participle };
}

/**
 * Full accepted answers as the student types them: for "je" the pronoun is
 * part of the answer (elision is tested), for other persons only the verb.
 */
export function answerStrings(forms: string[], p: Person): string[] {
  return p === 'je' ? forms.map(withJe) : forms;
}

export function pcString(f: PcForm): string {
  return `${f.aux} ${f.participle}`;
}
