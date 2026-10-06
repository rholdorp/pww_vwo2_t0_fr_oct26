import { describe, expect, it } from 'vitest';
import { pack } from '../content/pww-oct26';
import { buildPracticeTest, formatGrade, grade } from './practiceTest';
import { questionItems } from './question';

describe('practice test', () => {
  const qs = buildPracticeTest(pack, Math.random);
  const forms = qs.filter((q) => q.kind === 'form');

  it('has 40 typed questions: 10/10/10/10', () => {
    expect(qs).toHaveLength(40);
    expect(qs.every((q) => q.mode === 'type')).toBe(true);
    const regularPres = forms.filter((q) => q.kind === 'form' && q.tense === 'pres' && 'nr' in q.verb);
    const irregularPres = forms.filter((q) => q.kind === 'form' && q.tense === 'pres' && !('nr' in q.verb));
    const pc = forms.filter((q) => q.kind === 'form' && q.tense === 'pc');
    expect(regularPres).toHaveLength(10);
    expect(irregularPres).toHaveLength(10);
    expect(pc).toHaveLength(10);
    expect(qs.filter((q) => q.kind === 'vocab')).toHaveLength(10);
  });

  it('asks test sentences with subjects like in the draaiboek', () => {
    for (const q of forms) {
      if (q.kind !== 'form') continue;
      expect(q.dutchPrompt).toBe(true);
      expect(q.subject!.person).toBe(q.person);
    }
  });

  it('never asks arriver/rentrer in the passé composé or aller in the passé composé', () => {
    for (let i = 0; i < 30; i++) {
      for (const q of buildPracticeTest(pack, Math.random)) {
        if (q.kind === 'form' && q.tense === 'pc') expect(['arriver', 'rentrer', 'aller']).not.toContain(q.verb.id);
      }
    }
  });

  it('vocabulary in both directions', () => {
    const dirs = qs.filter((q) => q.kind === 'vocab').map((q) => (q.kind === 'vocab' ? q.dir : ''));
    expect(dirs.filter((d) => d === 'nl2fr')).toHaveLength(5);
    expect(dirs.filter((d) => d === 'fr2nl')).toHaveLength(5);
  });

  it('every question counts for at least one item', () => {
    for (const q of qs) expect(questionItems(q).length).toBeGreaterThan(0);
  });
});

describe('grade', () => {
  it('32 of 40 → 8,2', () => {
    expect(grade(32, 40)).toBe(8.2);
    expect(formatGrade(grade(32, 40))).toBe('8,2');
  });
  it('0 → 1, all → 10', () => {
    expect(grade(0, 40)).toBe(1);
    expect(grade(40, 40)).toBe(10);
  });
});
