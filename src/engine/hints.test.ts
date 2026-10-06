import { describe, expect, it } from 'vitest';
import { regularVerbs } from '../content/pww-oct26';
import type { Person } from '../content/types';
import { check } from './check';
import { hintText } from './hints';
import type { FormQuestion } from './question';
import { diffAgainstModel } from './text';

const q = (id: string, person: Person, subject = true): FormQuestion => ({
  key: 'k', mode: 'type', kind: 'form', tense: 'pres', verb: regularVerbs.find((v) => v.id === id)!, person,
  subject: subject ? { label: 'Vous', person } : undefined, dutchPrompt: subject,
});

describe('feedback on a wrong answer', () => {
  it('shows the model answer, marks the ending and names the rule', () => {
    const r = check(q('chercher', 'vous'), 'cherchons', regularVerbs);
    expect(r.model).toBe('cherchez');
    expect(r.diff).toEqual([{ text: 'cherch', ok: true }, { text: 'ez', ok: false }]);
    expect(hintText(r.hint!)).toBe('vous → stam + ez');
  });

  it("marks the apostrophe for je aime", () => {
    const r = check(q('aimer', 'je', false), 'je aime', regularVerbs);
    expect(r.model).toBe("j'aime");
    expect(r.diff).toEqual([{ text: 'j', ok: true }, { text: "'", ok: false }, { text: 'aime', ok: true }]);
    expect(hintText(r.hint!)).toContain("je → j'");
  });

  it('marks a missing accent', () => {
    expect(diffAgainstModel('avons achete', 'avons acheté')).toEqual([
      { text: 'avons achet', ok: true },
      { text: 'é', ok: false },
    ]);
  });

  it('has no diff when correct', () => {
    expect(check(q('chercher', 'vous'), 'cherchez', regularVerbs).diff).toEqual([]);
  });
});
