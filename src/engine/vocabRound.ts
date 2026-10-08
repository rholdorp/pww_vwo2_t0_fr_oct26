// A round in the vocabulary trainer (vocab-trainer spec, design D1):
// 20 word pairs, each once, random direction per word, always typed.

import { itemId } from '../content/items';
import type { ContentPack, VocabItem, VocabPart } from '../content/types';
import type { Rng } from './generate';
import { shuffle } from './generate';
import type { ItemState } from './mastery';
import { levelOf } from './mastery';
import type { VocabQuestion } from './question';

export type VocabChoice = VocabPart | 'all';
export const ROUND_SIZE = 20;

let n = 0;

function weakest(words: VocabItem[], states: Map<string, ItemState>, rng: Rng): VocabItem[] {
  const level = (w: VocabItem) =>
    Math.min(levelOf(states, itemId.vocab(w, 'fr2nl')), levelOf(states, itemId.vocab(w, 'nl2fr')));
  return words
    .map((w) => ({ w, level: level(w), tie: rng() }))
    .sort((a, b) => a.level - b.level || a.tie - b.tie)
    .slice(0, ROUND_SIZE)
    .map((x) => x.w);
}

export function buildVocabRound(
  pack: ContentPack, choice: VocabChoice, states: Map<string, ItemState>, rng: Rng,
): VocabQuestion[] {
  const words = choice === 'all'
    ? weakest(pack.vocab, states, rng)
    : pack.vocab.filter((w) => w.part === choice);
  return shuffle(words, rng).map((word) => ({
    key: `v${++n}`,
    mode: 'type',
    kind: 'vocab',
    word,
    dir: rng() < 0.5 ? 'fr2nl' : 'nl2fr',
  }));
}
