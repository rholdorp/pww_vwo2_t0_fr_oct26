import { describe, expect, it } from 'vitest';
import { irregularVerbs, regularVerbs, subjects, vocab } from '../content/pww-oct26';
import type { Person, Tense } from '../content/types';
import { check } from './check';
import type { FormQuestion, Question } from './question';
import { expandPhrase, normalize } from './text';

const verb = (id: string) => regularVerbs.find((v) => v.id === id)!;
const irr = (id: string) => irregularVerbs.find((v) => v.id === id)!;
const word = (fr: string) => vocab.find((v) => v.fr === fr)!;
const subject = (label: string) => subjects.find((s) => s.label === label)!;

function form(verbId: string, person: Person, tense: Tense = 'pres', subjectLabel?: string): FormQuestion {
  const v = regularVerbs.find((x) => x.id === verbId) ?? irr(verbId);
  return {
    key: 'k', mode: 'type', kind: 'form', tense, verb: v, person,
    subject: subjectLabel ? subject(subjectLabel) : undefined, dutchPrompt: !!subjectLabel,
  };
}
const nl2fr = (fr: string): Question => ({ key: 'k', mode: 'type', kind: 'vocab', word: word(fr), dir: 'nl2fr' });
const fr2nl = (fr: string): Question => ({ key: 'k', mode: 'type', kind: 'vocab', word: word(fr), dir: 'fr2nl' });
const meaningFr2nl = (id: string): Question => ({ key: 'k', mode: 'type', kind: 'meaning', verb: verb(id), dir: 'fr2nl' });
const ok = (q: Question, a: string) => check(q, a, regularVerbs).correct;

describe('text helpers', () => {
  it('normalizes formatting but keeps accents', () => {
    expect(normalize('  J’aime   ')).toBe("j'aime");
    expect(normalize('Nous  Avons Acheté')).toBe('nous avons acheté');
    expect(normalize("j' aime")).toBe("j'aime");
  });

  it('expands book notation', () => {
    expect(expandPhrase("l'ami(e)")).toEqual(["l'amie", "l'ami"]);
    expect(expandPhrase('le/la jeune')).toEqual(['le jeune', 'la jeune']);
    expect(expandPhrase('in/naar Spanje')).toEqual(['in spanje', 'naar spanje']);
    expect(expandPhrase('(iets) voorstellen')).toEqual(['iets voorstellen', 'voorstellen']);
    expect(expandPhrase('het weer, de tijd')).toEqual(['het weer', 'de tijd']);
  });
});

describe('formatting does not count', () => {
  it('accepts a capital and a curly apostrophe', () => {
    expect(ok(form('aimer', 'je'), 'J’aime ')).toBe(true);
  });
});

describe('accents count', () => {
  it('rejects a missing accent in the participle', () => {
    const r = check(form('acheter', 'nous', 'pc'), 'avons achete', regularVerbs);
    expect(r.correct).toBe(false);
    expect(r.hint).toEqual({ key: 'accent' });
  });

  it('rejects a missing cedilla', () => {
    expect(ok(form('commencer', 'nous'), 'commencons')).toBe(false);
  });

  it('rejects a missing accent in a French word', () => {
    const r = check(nl2fr('la météo'), 'la meteo');
    expect(r.correct).toBe(false);
    expect(r.hint).toEqual({ key: 'accent' });
  });
});

describe('elision counts', () => {
  it('rejects je before a vowel', () => {
    const r = check(form('aimer', 'je'), 'je aime', regularVerbs);
    expect(r.correct).toBe(false);
    expect(r.hint).toEqual({ key: 'elision', shouldElide: true });
  });

  it("rejects j' before a consonant", () => {
    expect(ok(form('donner', 'je'), "j'donne")).toBe(false);
  });

  it('requires the pronoun for je', () => {
    const r = check(form('donner', 'je'), 'donne', regularVerbs);
    expect(r.correct).toBe(false);
    expect(r.hint).toEqual({ key: 'no-pronoun' });
  });

  it("accepts j'ai été", () => {
    expect(ok(form('etre', 'je', 'pc'), "j'ai été")).toBe(true);
  });
});

describe('pronoun optional for other persons', () => {
  it('accepts with or without nous', () => {
    const q = form('donner', 'nous', 'pres', 'Nous');
    expect(ok(q, 'donnons')).toBe(true);
    expect(ok(q, 'nous donnons')).toBe(true);
  });

  it('accepts elle and on for il', () => {
    expect(ok(form('parler', 'il'), 'elle parle')).toBe(true);
    expect(ok(form('parler', 'il'), 'on parle')).toBe(true);
  });

  it('rejects the wrong pronoun', () => {
    expect(ok(form('donner', 'nous'), 'vous donnons')).toBe(false);
  });

  it('accepts both spellings of payer', () => {
    expect(ok(form('payer', 'je'), 'je paie')).toBe(true);
    expect(ok(form('payer', 'je'), 'je paye')).toBe(true);
  });

  it('rejects mangons', () => {
    expect(ok(form('manger', 'nous'), 'mangons')).toBe(false);
    expect(ok(form('manger', 'nous'), 'mangeons')).toBe(true);
  });
});

describe('article with French words', () => {
  it('reports a missing article', () => {
    const r = check(nl2fr('la mer'), 'mer');
    expect(r.correct).toBe(false);
    expect(r.hint).toEqual({ key: 'article' });
  });

  it('accepts masculine and feminine', () => {
    expect(ok(nl2fr("l'ami(e)"), "l'amie")).toBe(true);
    expect(ok(nl2fr("l'ami(e)"), "l'ami")).toBe(true);
    expect(ok(nl2fr('le/la jeune'), 'la jeune')).toBe(true);
  });

  it('rejects the wrong article', () => {
    expect(ok(nl2fr('la mer'), 'le mer')).toBe(false);
  });
});

describe('lenient with Dutch answers', () => {
  it('accepts one of several meanings', () => {
    expect(ok(meaningFr2nl('parler'), 'spreken')).toBe(true);
    expect(ok(fr2nl('le temps'), 'de tijd')).toBe(true);
    expect(ok(fr2nl('le temps'), 'het weer')).toBe(true);
  });

  it('accepts without article and without parenthesised part', () => {
    expect(ok(fr2nl('proposer'), 'voorstellen')).toBe(true);
    expect(ok(fr2nl('la mer'), 'zee')).toBe(true);
    expect(ok(fr2nl('en Belgique'), 'naar belgie')).toBe(true);
  });

  it('rejects a wrong meaning', () => {
    expect(ok(fr2nl('la mer'), 'de berg')).toBe(false);
  });
});

describe('multiple choice', () => {
  it('compares with the displayed answer', () => {
    const q: Question = { ...nl2fr("l'ami(e)"), mode: 'mc', options: ["l'ami(e)", 'le frère'] };
    expect(ok(q, "l'ami(e)")).toBe(true);
    expect(ok(q, 'le frère')).toBe(false);
  });
});
