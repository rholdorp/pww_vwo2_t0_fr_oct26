// Text helpers for checking answers (design D4).

/** Formatting does not count: case, outer/double spaces, apostrophe type. Accents stay. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/' /g, "'")
    .trim();
}

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').normalize('NFC');
}

/**
 * All accepted spellings of a phrase as printed in the book:
 * "a, b" → a | b;  "in/naar Spanje" → in Spanje | naar Spanje;
 * "l'ami(e)" → l'ami | l'amie;  "(iets) voorstellen" → iets voorstellen | voorstellen.
 */
export function expandPhrase(raw: string): string[] {
  const out = new Set<string>();
  for (const alt of raw.split(/,\s*/)) {
    for (const p of expandParens(alt)) {
      for (const s of expandSlashes(p)) out.add(normalize(s));
    }
  }
  return [...out].filter((s) => s.length > 0);
}

function expandParens(s: string): string[] {
  const m = s.match(/\(([^)]*)\)/);
  if (!m) return [s];
  const before = s.slice(0, m.index);
  const after = s.slice(m.index! + m[0].length);
  return [...expandParens(before + m[1] + after), ...expandParens(before + after)];
}

function expandSlashes(s: string): string[] {
  let results = [''];
  for (const token of s.split(' ')) {
    const options = token.split('/');
    results = results.flatMap((r) => options.map((o) => (r ? `${r} ${o}` : o)));
  }
  return results;
}

const NL_ARTICLE = /^(de|het|een) /;
const FR_ARTICLE = /^(le |la |les |l')/;

export function stripDutchArticle(s: string): string {
  return s.replace(NL_ARTICLE, '');
}

export function stripFrenchArticle(s: string): string {
  return s.replace(FR_ARTICLE, '');
}

export function hasFrenchArticle(s: string): boolean {
  return FR_ARTICLE.test(s);
}

export interface DiffPart {
  text: string;
  /** False for characters of the model answer that the student got wrong or left out. */
  ok: boolean;
}

/** Marks the characters of `model` that are not matched in `answer` (LCS). */
export function diffAgainstModel(answer: string, model: string): DiffPart[] {
  const a = [...answer];
  const m = [...model];
  const dp: number[][] = Array.from({ length: m.length + 1 }, () => new Array(a.length + 1).fill(0));
  for (let i = m.length - 1; i >= 0; i--) {
    for (let j = a.length - 1; j >= 0; j--) {
      dp[i][j] = m[i] === a[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const flags: boolean[] = [];
  let i = 0;
  let j = 0;
  while (i < m.length) {
    if (j < a.length && m[i] === a[j]) {
      flags.push(true);
      i++;
      j++;
    } else if (j < a.length && dp[i][j + 1] >= dp[i + 1][j]) {
      j++;
    } else {
      flags.push(false);
      i++;
    }
  }
  const parts: DiffPart[] = [];
  m.forEach((ch, k) => {
    const last = parts[parts.length - 1];
    if (last && last.ok === flags[k]) last.text += ch;
    else parts.push({ text: ch, ok: flags[k] });
  });
  return parts;
}
