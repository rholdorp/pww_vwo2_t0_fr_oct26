// Dutch explanation for a wrong answer (answer-checking: "Uitleg bij een fout antwoord").

import { PRES_ENDINGS, regularPres } from '../content/conjugate';
import { PERSON_LABEL } from '../content/types';
import type { Hint } from './check';

export function hintText(h: Hint): string {
  switch (h.key) {
    case 'accent':
      return 'Bijna goed, maar let op de accenten (é, è, ê, à, ç). Die tellen mee.';
    case 'article':
      return 'Het lidwoord ontbreekt. Leer bij een zelfstandig naamwoord altijd le, la of l\' mee.';
    case 'elision':
      return h.shouldElide
        ? "Voor een klinker of h wordt je → j' (j'aime, j'habite, j'ai)."
        : "Alleen voor een klinker of h wordt je → j'. Hier blijft het je.";
    case 'no-pronoun':
      return "Schrijf bij je het voornaamwoord erbij: je of j'.";
    case 'wrong-pronoun':
      return `Het onderwerp is ${PERSON_LABEL[h.person]}.`;
    case 'ending':
      return `${PERSON_LABEL[h.person]} → stam + ${PRES_ENDINGS[h.person]}`;
    case 'spelling': {
      const form = regularPres(h.verb, h.person).join(' of ');
      return `Let op de spelling van ${h.verb.inf}: ${PERSON_LABEL[h.person]} ${form}.`;
    }
    case 'irregular':
      return `${h.verb.inf} is onregelmatig: deze vormen leer je uit je hoofd.`;
    case 'aux':
      return 'De passé composé maak je met avoir in de présent: j\'ai, tu as, il a, nous avons, vous avez, ils ont.';
    case 'participle-rule':
      return 'Voltooid deelwoord van een -er werkwoord: stam + é (donner → donné).';
    case 'participle':
      return `Het voltooid deelwoord van ${h.verb.inf} is onregelmatig: ${h.verb.participle}.`;
    case 'meaning':
      return `${h.verb.nlPrompt} = ${h.verb.inf}.`;
  }
}
