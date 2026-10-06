// Item ids and block layout (design D3). Mastery is tracked per item;
// a question refers to one or more items.

import type { Block, ContentPack, IrregularVerb, Person, RegularVerb, VocabItem } from './types';
import { PERSONS, PERSON_LABEL } from './types';

export type Direction = 'fr2nl' | 'nl2fr';

export const itemId = {
  vocab: (v: VocabItem, d: Direction) => `voc:${v.id}:${d}`,
  meaning: (v: RegularVerb, d: Direction) => `mean:${v.id}:${d}`,
  ending: (p: Person) => `end:pres:${p}`,
  spelling: (v: RegularVerb, p: Person) => `spell:${v.id}:${p}`,
  irregular: (v: IrregularVerb, p: Person) => `irr:pres:${v.id}:${p}`,
  pcRule: () => 'pc:rule',
  participle: (v: IrregularVerb) => `pc:part:${v.id}`,
  aux: (p: Person) => `pc:aux:${p}`,
};

export function spellingPersons(v: RegularVerb): Person[] {
  return PERSONS.filter((p) => v.presOverrides?.[p]);
}

export interface ItemInfo {
  id: string;
  block: Block;
  /** Short Dutch label, used for weak points on the dashboard. */
  label: string;
}

export function allItems(pack: Pick<ContentPack, 'regularVerbs' | 'irregularVerbs' | 'vocab'>): ItemInfo[] {
  const items: ItemInfo[] = [];
  const add = (id: string, block: Block, label: string) => items.push({ id, block, label });

  // Block 1: présent
  for (const v of pack.regularVerbs) {
    add(itemId.meaning(v, 'nl2fr'), 1, `${v.nlPrompt} → ${v.inf}`);
    add(itemId.meaning(v, 'fr2nl'), 1, `${v.inf} → ${v.nlPrompt}`);
  }
  for (const p of PERSONS) add(itemId.ending(p), 1, `uitgang présent bij ${PERSON_LABEL[p]}`);
  for (const v of pack.regularVerbs) {
    for (const p of spellingPersons(v)) {
      add(itemId.spelling(v, p), 1, `${v.inf} - ${PERSON_LABEL[p]} ${v.presOverrides![p]![0]}`);
    }
  }
  for (const v of pack.irregularVerbs) {
    for (const p of PERSONS) add(itemId.irregular(v, p), 1, `${v.inf} - ${PERSON_LABEL[p]} ${v.pres[p]}`);
  }

  // Block 2: passé composé
  add(itemId.pcRule(), 2, 'voltooid deelwoord: stam + é');
  for (const v of pack.irregularVerbs) {
    if (v.participle) add(itemId.participle(v), 2, `voltooid deelwoord van ${v.inf}: ${v.participle}`);
  }
  for (const p of PERSONS) add(itemId.aux(p), 2, `hulpwerkwoord bij ${PERSON_LABEL[p]}`);

  // Block 3: vocabulaire
  for (const v of pack.vocab) {
    add(itemId.vocab(v, 'fr2nl'), 3, `${v.fr} → ${v.nl}`);
    add(itemId.vocab(v, 'nl2fr'), 3, `${v.nl} → ${v.fr}`);
  }
  return items;
}

export const BLOCK_TITLE: Record<Block, string> = {
  1: 'Présent',
  2: 'Passé composé',
  3: 'Vocabulaire',
};
