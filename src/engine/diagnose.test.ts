import { describe, expect, it } from 'vitest';
import { irregularVerbs, regularVerbs, subjects } from '../content/pww-oct26';
import type { Person, Tense } from '../content/types';
import { check, identifyVerb } from './check';
import type { FormQuestion } from './question';

const verb = (id: string) => regularVerbs.find((v) => v.id === id) ?? irregularVerbs.find((v) => v.id === id)!;
const sentence = (id: string, person: Person, label: string, tense: Tense = 'pres'): FormQuestion => ({
  key: 'k', mode: 'type', kind: 'form', tense, verb: verb(id), person,
  subject: subjects.find((s) => s.label === label)!, dutchPrompt: true,
});
const run = (q: FormQuestion, a: string) => check(q, a, regularVerbs);

describe('test sentence in the présent', () => {
  it('right verb, wrong ending: meaning good, ending wrong', () => {
    const r = run(sentence('acheter', 'nous', 'Nous'), 'achetez');
    expect(r.correct).toBe(false);
    expect(r.perItem).toEqual({ 'mean:acheter:nl2fr': true, 'end:pres:nous': false });
    expect(r.hint).toEqual({ key: 'ending', person: 'nous' });
  });

  it('wrong verb: meaning wrong, ending not judged', () => {
    const r = run(sentence('acheter', 'nous', 'Nous'), 'trouvons');
    expect(r.perItem).toEqual({ 'mean:acheter:nl2fr': false });
    expect(r.hint).toMatchObject({ key: 'meaning' });
  });

  it('correct answer credits meaning and ending', () => {
    const r = run(sentence('donner', 'ils', 'Les filles'), 'donnent');
    expect(r.correct).toBe(true);
    expect(r.perItem).toEqual({ 'mean:donner:nl2fr': true, 'end:pres:ils': true });
  });

  it('spelling variant counts for the spelling item', () => {
    const r = run(sentence('manger', 'nous', 'Nous'), 'mangons');
    expect(r.perItem).toEqual({ 'mean:manger:nl2fr': true, 'spell:manger:nous': false });
    expect(r.hint).toMatchObject({ key: 'spelling' });
  });

  it('elision error counts against the je form, not the meaning', () => {
    const r = run(sentence('aimer', 'je', 'Je'), 'je aime');
    expect(r.perItem).toEqual({ 'mean:aimer:nl2fr': true, 'end:pres:je': false });
  });

  it('irregular verb counts for the irregular form', () => {
    const r = run(sentence('aller', 'ils', 'Les filles'), 'vont');
    expect(r.perItem).toEqual({ 'irr:pres:aller:ils': true });
    expect(run(sentence('aller', 'ils', 'Les filles'), 'vas').hint).toMatchObject({ key: 'irregular' });
  });
});

describe('passé composé', () => {
  it('splits auxiliary and participle', () => {
    const r = run(sentence('acheter', 'nous', 'Nous', 'pc'), 'avez acheté');
    expect(r.perItem).toEqual({ 'pc:aux:nous': false, 'mean:acheter:nl2fr': true, 'pc:rule': true });
    expect(r.hint).toEqual({ key: 'aux', person: 'nous' });
  });

  it('wrong participle ending counts against the rule', () => {
    const r = run(sentence('donner', 'il', 'Le prof', 'pc'), 'a donner');
    expect(r.perItem).toEqual({ 'pc:aux:il': true, 'mean:donner:nl2fr': true, 'pc:rule': false });
    expect(r.hint).toEqual({ key: 'participle-rule' });
  });

  it('wrong verb in the passé composé', () => {
    const r = run(sentence('payer', 'vous', 'Vous', 'pc'), 'avez parlé');
    expect(r.perItem).toEqual({ 'pc:aux:vous': true, 'mean:payer:nl2fr': false });
  });

  it('irregular participle', () => {
    const r = run(sentence('faire', 'ils', 'Ils', 'pc'), 'ont faisé');
    expect(r.perItem).toEqual({ 'pc:aux:ils': true, 'pc:part:faire': false });
    expect(r.hint).toMatchObject({ key: 'participle' });
  });

  it("je ai counts against the auxiliary", () => {
    const r = run(sentence('chercher', 'je', 'Je', 'pc'), 'je ai cherché');
    expect(r.correct).toBe(false);
    expect(r.perItem['pc:aux:je']).toBe(false);
    expect(r.perItem['pc:rule']).toBe(true);
  });
});

describe('identifyVerb', () => {
  const v = (id: string) => regularVerbs.find((x) => x.id === id)!;
  it('prefers the longest matching stem', () => {
    expect(identifyVerb('parlons', v('payer'), regularVerbs)).toBe(v('parler'));
    expect(identifyVerb('paient', v('payer'), regularVerbs)).toBe(v('payer'));
    expect(identifyVerb('achètes', v('acheter'), regularVerbs)).toBe(v('acheter'));
    expect(identifyVerb('xyz', v('acheter'), regularVerbs)).toBeUndefined();
  });
});
