// Name-only login (learner-identity spec, design D6).

const STORAGE_KEY = 'trainer.name';

/** Trim, collapse spaces. */
export function cleanName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

/** Returns an error message in Dutch, or undefined when the name is fine. */
export function validateName(raw: string): string | undefined {
  const name = cleanName(raw);
  if (name.length < 2 || name.length > 20) return 'Kies een naam van 2 tot 20 tekens.';
  if (!/^[\p{L}\p{N} -]+$/u.test(name)) return 'Gebruik alleen letters, cijfers, spaties of een streepje.';
  if (nameKey(name).length < 2) return 'Kies een naam met minstens 2 letters of cijfers.';
  return undefined;
}

/** "Stijn " and "stijn" → "stijn"; "Anne Marie" → "anne-marie"; accents removed. */
export function nameKey(raw: string): string {
  return cleanName(raw)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
}

export function loadName(): string | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveName(name: string | undefined): void {
  try {
    if (name) localStorage.setItem(STORAGE_KEY, name);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode: the name is simply asked again next time.
  }
}
