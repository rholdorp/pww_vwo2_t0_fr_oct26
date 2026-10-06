// Practice test in the format of the real test (practice-test spec).

import type { ContentPack, IrregularVerb, Person, RegularVerb, Tense } from '../content/types';
import { PERSONS } from '../content/types';
import type { Rng } from './generate';
import { pick, shuffle } from './generate';
import type { FormQuestion, Question, VocabQuestion } from './question';

export const TEST_PARTS = { regular: 10, irregular: 10, pc: 10, vocab: 10 };

let n = 0;
const key = () => `t${++n}`;

function sentence(
  pack: ContentPack, verb: RegularVerb | IrregularVerb, tense: Tense, person: Person, rng: Rng,
): FormQuestion {
  return {
    key: key(), mode: 'type', kind: 'form', tense, verb, person,
    subject: pick(pack.subjects.filter((s) => s.person === person), rng),
    dutchPrompt: true,
  };
}

/** n questions with different verbs where possible and every person used. */
function sentences(
  pack: ContentPack, verbs: (RegularVerb | IrregularVerb)[], tense: Tense, count: number, rng: Rng,
): FormQuestion[] {
  const vs = shuffle(verbs, rng);
  const persons = shuffle([...PERSONS, ...PERSONS], rng);
  return Array.from({ length: count }, (_, i) => sentence(pack, vs[i % vs.length], tense, persons[i % persons.length], rng));
}

export function buildPracticeTest(pack: ContentPack, rng: Rng): Question[] {
  const regular = sentences(pack, pack.regularVerbs, 'pres', TEST_PARTS.regular, rng);
  const irregular = sentences(pack, pack.irregularVerbs, 'pres', TEST_PARTS.irregular, rng);
  const pcVerbs = [
    ...pack.regularVerbs.filter((v) => !v.noPC),
    // Irregular participles twice in the pool, so they come up regularly.
    ...pack.irregularVerbs.filter((v) => v.participle),
    ...pack.irregularVerbs.filter((v) => v.participle),
  ];
  const pc = sentences(pack, pcVerbs, 'pc', TEST_PARTS.pc, rng);
  const words = shuffle(pack.vocab, rng).slice(0, TEST_PARTS.vocab);
  const vocab: VocabQuestion[] = words.map((word, i) => ({
    key: key(), mode: 'type', kind: 'vocab', word, dir: i % 2 === 0 ? 'nl2fr' : 'fr2nl',
  }));
  return [...regular, ...irregular, ...pc, ...vocab];
}

/** 1 + 9 × correct / total, one decimal. */
export function grade(correct: number, total: number): number {
  return Math.round((1 + (9 * correct) / total) * 10) / 10;
}

export function formatGrade(g: number): string {
  return g.toFixed(1).replace('.', ',');
}
