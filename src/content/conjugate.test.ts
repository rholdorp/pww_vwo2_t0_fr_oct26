import { describe, expect, it } from 'vitest';
import {
  answerStrings, irregularPc, irregularPres, pcString, regularPc, regularPres,
} from './conjugate';
import { irregularVerbs, regularVerbs } from './pww-oct26';
import { PERSONS } from './types';

// Reference table written out by hand: je|tu|il|nous|vous|ils.
// Alternatives separated by "/". Participle in the last column ("-" = not asked).
const PRES_TABLE: Record<string, [string, string]> = {
  visiter: ['visite visites visite visitons visitez visitent', 'visité'],
  détester: ['déteste détestes déteste détestons détestez détestent', 'détesté'],
  commencer: ['commence commences commence commençons commencez commencent', 'commencé'],
  parler: ['parle parles parle parlons parlez parlent', 'parlé'],
  manger: ['mange manges mange mangeons mangez mangent', 'mangé'],
  payer: ['paie/paye paies/payes paie/paye payons payez paient/payent', 'payé'],
  adorer: ['adore adores adore adorons adorez adorent', 'adoré'],
  préférer: ['préfère préfères préfère préférons préférez préfèrent', 'préféré'],
  organiser: ['organise organises organise organisons organisez organisent', 'organisé'],
  inviter: ['invite invites invite invitons invitez invitent', 'invité'],
  rentrer: ['rentre rentres rentre rentrons rentrez rentrent', '-'],
  aider: ['aide aides aide aidons aidez aident', 'aidé'],
  chercher: ['cherche cherches cherche cherchons cherchez cherchent', 'cherché'],
  trouver: ['trouve trouves trouve trouvons trouvez trouvent', 'trouvé'],
  regarder: ['regarde regardes regarde regardons regardez regardent', 'regardé'],
  aimer: ['aime aimes aime aimons aimez aiment', 'aimé'],
  acheter: ['achète achètes achète achetons achetez achètent', 'acheté'],
  changer: ['change changes change changeons changez changent', 'changé'],
  essayer: ['essaie/essaye essaies/essayes essaie/essaye essayons essayez essaient/essayent', 'essayé'],
  habiter: ['habite habites habite habitons habitez habitent', 'habité'],
  donner: ['donne donnes donne donnons donnez donnent', 'donné'],
  jouer: ['joue joues joue jouons jouez jouent', 'joué'],
  travailler: ['travaille travailles travaille travaillons travaillez travaillent', 'travaillé'],
  arriver: ['arrive arrives arrive arrivons arrivez arrivent', '-'],
  oublier: ['oublie oublies oublie oublions oubliez oublient', 'oublié'],
};

const AUX = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];

describe('regular -er verbs', () => {
  it('covers exactly the 25 verbs of the list', () => {
    expect(regularVerbs.map((v) => v.inf).sort()).toEqual(Object.keys(PRES_TABLE).sort());
    expect(regularVerbs.map((v) => v.nr)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  for (const verb of regularVerbs) {
    const [pres, participle] = PRES_TABLE[verb.inf];
    const expected = pres.split(' ').map((f) => f.split('/'));

    it(`${verb.inf}: présent`, () => {
      PERSONS.forEach((p, i) => expect(regularPres(verb, p)).toEqual(expected[i]));
    });

    it(`${verb.inf}: passé composé`, () => {
      if (participle === '-') {
        expect(verb.noPC).toBe(true);
        expect(() => regularPc(verb, 'je')).toThrow();
        return;
      }
      PERSONS.forEach((p, i) => expect(pcString(regularPc(verb, p))).toBe(`${AUX[i]} ${participle}`));
    });

    it(`${verb.inf}: elision flag matches the first letter`, () => {
      expect(answerStrings(regularPres(verb, 'je'), 'je')[0].startsWith("j'")).toBe(verb.elide);
    });
  }
});

describe('irregular verbs', () => {
  const PRES: Record<string, string> = {
    être: 'suis es est sommes êtes sont',
    avoir: 'ai as a avons avez ont',
    faire: 'fais fais fait faisons faites font',
    aller: 'vais vas va allons allez vont',
  };
  const PART: Record<string, string> = { être: 'été', avoir: 'eu', faire: 'fait' };

  for (const verb of irregularVerbs) {
    it(`${verb.inf}: présent`, () => {
      expect(PERSONS.map((p) => irregularPres(verb, p)).join(' ')).toBe(PRES[verb.inf]);
    });
    it(`${verb.inf}: passé composé`, () => {
      if (!PART[verb.inf]) {
        expect(() => irregularPc(verb, 'je')).toThrow();
        return;
      }
      PERSONS.forEach((p, i) => expect(pcString(irregularPc(verb, p))).toBe(`${AUX[i]} ${PART[verb.inf]}`));
    });
  }
});

describe('answers with je', () => {
  const byId = (id: string) => regularVerbs.find((v) => v.id === id)!;

  it('elides before a vowel or mute h', () => {
    expect(answerStrings(regularPres(byId('aimer'), 'je'), 'je')).toEqual(["j'aime"]);
    expect(answerStrings(regularPres(byId('habiter'), 'je'), 'je')).toEqual(["j'habite"]);
    expect(answerStrings(regularPres(byId('acheter'), 'je'), 'je')).toEqual(["j'achète"]);
  });

  it('keeps je before a consonant', () => {
    expect(answerStrings(regularPres(byId('donner'), 'je'), 'je')).toEqual(['je donne']);
    expect(answerStrings(regularPres(byId('payer'), 'je'), 'je')).toEqual(['je paie', 'je paye']);
  });

  it('builds the spec examples', () => {
    expect(regularPres(byId('donner'), 'nous')).toEqual(['donnons']);
    expect(irregularPres(irregularVerbs.find((v) => v.id === 'aller')!, 'ils')).toBe('vont');
    expect(pcString(regularPc(byId('acheter'), 'nous'))).toBe('avons acheté');
    const etre = irregularVerbs.find((v) => v.id === 'etre')!;
    expect(answerStrings([pcString(irregularPc(etre, 'je'))], 'je')).toEqual(["j'ai été"]);
  });
});
