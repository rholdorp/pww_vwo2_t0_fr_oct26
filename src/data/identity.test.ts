import { describe, expect, it } from 'vitest';
import { cleanName, nameKey, validateName } from './identity';

describe('name login', () => {
  it('accepts normal names', () => {
    expect(validateName('Stijn')).toBeUndefined();
    expect(validateName('Anne-Marie 2')).toBeUndefined();
    expect(validateName('Zoë')).toBeUndefined();
  });

  it('rejects too short, too long and odd characters', () => {
    expect(validateName('S')).toBeDefined();
    expect(validateName('a'.repeat(21))).toBeDefined();
    expect(validateName('st@ijn')).toBeDefined();
    expect(validateName('stijn/lars')).toBeDefined();
  });

  it('maps different spellings of the same name to one key', () => {
    expect(nameKey('Stijn')).toBe('stijn');
    expect(nameKey('stijn ')).toBe('stijn');
    expect(nameKey('  STIJN')).toBe('stijn');
    expect(nameKey('Anne  Marie')).toBe('anne-marie');
    expect(nameKey('Zoë')).toBe('zoe');
  });

  it('keys match the Firestore rule pattern', () => {
    for (const n of ['Stijn', 'Anne Marie', 'Zoë', 'Lars-2']) expect(nameKey(n)).toMatch(/^[a-z0-9-]{2,20}$/);
  });

  it('cleans spaces for display', () => {
    expect(cleanName('  Anne   Marie ')).toBe('Anne Marie');
  });
});
