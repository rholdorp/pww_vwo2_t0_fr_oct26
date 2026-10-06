// Content pack: proefwerk Frans VWO 2, oktober 2026.
// Source: "V2_ Draaiboek oktober 2025 Grammatica VERSION ELEVE.pdf".

import type { IrregularVerb, RegularVerb, Subject, VocabItem, VocabPart } from './types';

// Draaiboek p.5: "Deze lijst van regelmatige werkwoorden op -er moet je
// helemaal uit je hoofd leren F-N-F". Spelling overrides follow correct
// French where stem + ending does not hold (proposal, study-content spec).
export const regularVerbs: RegularVerb[] = [
  { id: 'visiter', nr: 1, inf: 'visiter', nl: ['bezoeken'], nlPrompt: 'bezoeken', elide: false },
  { id: 'detester', nr: 2, inf: 'détester', nl: ['een hekel hebben aan'], nlPrompt: 'een hekel hebben aan', elide: false },
  {
    id: 'commencer', nr: 3, inf: 'commencer', nl: ['beginnen'], nlPrompt: 'beginnen', elide: false,
    presOverrides: { nous: ['commençons'] },
  },
  { id: 'parler', nr: 4, inf: 'parler', nl: ['praten', 'spreken'], nlPrompt: 'praten/spreken', elide: false },
  {
    id: 'manger', nr: 5, inf: 'manger', nl: ['eten'], nlPrompt: 'eten', elide: false,
    presOverrides: { nous: ['mangeons'] },
  },
  {
    id: 'payer', nr: 6, inf: 'payer', nl: ['betalen'], nlPrompt: 'betalen', elide: false,
    presOverrides: {
      je: ['paie', 'paye'],
      tu: ['paies', 'payes'],
      il: ['paie', 'paye'],
      ils: ['paient', 'payent'],
    },
  },
  { id: 'adorer', nr: 7, inf: 'adorer', nl: ['dol zijn op'], nlPrompt: 'dol zijn op', elide: true },
  {
    id: 'preferer', nr: 8, inf: 'préférer', nl: ['liever hebben'], nlPrompt: 'liever hebben', elide: false,
    presOverrides: {
      je: ['préfère'],
      tu: ['préfères'],
      il: ['préfère'],
      ils: ['préfèrent'],
    },
  },
  { id: 'organiser', nr: 9, inf: 'organiser', nl: ['organiseren'], nlPrompt: 'organiseren', elide: true },
  { id: 'inviter', nr: 10, inf: 'inviter', nl: ['uitnodigen'], nlPrompt: 'uitnodigen', elide: true },
  { id: 'rentrer', nr: 11, inf: 'rentrer', nl: ['naar huis gaan'], nlPrompt: 'naar huis gaan', elide: false, noPC: true },
  { id: 'aider', nr: 12, inf: 'aider', nl: ['helpen'], nlPrompt: 'helpen', elide: true },
  { id: 'chercher', nr: 13, inf: 'chercher', nl: ['zoeken'], nlPrompt: 'zoeken', elide: false },
  { id: 'trouver', nr: 14, inf: 'trouver', nl: ['vinden'], nlPrompt: 'vinden', elide: false },
  { id: 'regarder', nr: 15, inf: 'regarder', nl: ['bekijken', 'kijken naar'], nlPrompt: 'bekijken/kijken naar', elide: false },
  { id: 'aimer', nr: 16, inf: 'aimer', nl: ['houden van'], nlPrompt: 'houden van', elide: true },
  {
    id: 'acheter', nr: 17, inf: 'acheter', nl: ['kopen'], nlPrompt: 'kopen', elide: true,
    presOverrides: {
      je: ['achète'],
      tu: ['achètes'],
      il: ['achète'],
      ils: ['achètent'],
    },
  },
  {
    id: 'changer', nr: 18, inf: 'changer', nl: ['veranderen'], nlPrompt: 'veranderen', elide: false,
    presOverrides: { nous: ['changeons'] },
  },
  {
    id: 'essayer', nr: 19, inf: 'essayer', nl: ['passen', 'proberen'], nlPrompt: 'passen/proberen', elide: true,
    presOverrides: {
      je: ['essaie', 'essaye'],
      tu: ['essaies', 'essayes'],
      il: ['essaie', 'essaye'],
      ils: ['essaient', 'essayent'],
    },
  },
  { id: 'habiter', nr: 20, inf: 'habiter', nl: ['wonen'], nlPrompt: 'wonen', elide: true },
  { id: 'donner', nr: 21, inf: 'donner', nl: ['geven'], nlPrompt: 'geven', elide: false },
  { id: 'jouer', nr: 22, inf: 'jouer', nl: ['spelen'], nlPrompt: 'spelen', elide: false },
  { id: 'travailler', nr: 23, inf: 'travailler', nl: ['werken'], nlPrompt: 'werken', elide: false },
  { id: 'arriver', nr: 24, inf: 'arriver', nl: ['aankomen'], nlPrompt: 'aankomen', elide: true, noPC: true },
  { id: 'oublier', nr: 25, inf: 'oublier', nl: ['vergeten'], nlPrompt: 'vergeten', elide: true },
];

// Draaiboek p.8 (présent) and p.17-20 (passé composé). aller is only tested
// in the présent, so it has no participle.
export const irregularVerbs: IrregularVerb[] = [
  {
    id: 'etre', inf: 'être', nl: ['zijn'], nlPrompt: 'zijn', elide: false,
    pres: { je: 'suis', tu: 'es', il: 'est', nous: 'sommes', vous: 'êtes', ils: 'sont' },
    participle: 'été',
  },
  {
    id: 'avoir', inf: 'avoir', nl: ['hebben'], nlPrompt: 'hebben', elide: true,
    pres: { je: 'ai', tu: 'as', il: 'a', nous: 'avons', vous: 'avez', ils: 'ont' },
    participle: 'eu',
  },
  {
    id: 'faire', inf: 'faire', nl: ['doen', 'maken'], nlPrompt: 'doen/maken', elide: false,
    pres: { je: 'fais', tu: 'fais', il: 'fait', nous: 'faisons', vous: 'faites', ils: 'font' },
    participle: 'fait',
  },
  {
    id: 'aller', inf: 'aller', nl: ['gaan'], nlPrompt: 'gaan', elide: false,
    pres: { je: 'vais', tu: 'vas', il: 'va', nous: 'allons', vous: 'allez', ils: 'vont' },
  },
];

// Subjects as used in the exercises of the draaiboek (Exercice 1-7).
export const subjects: Subject[] = [
  { label: 'Je', person: 'je' },
  { label: 'Tu', person: 'tu' },
  { label: 'Il', person: 'il' },
  { label: 'Elle', person: 'il' },
  { label: 'On', person: 'il' },
  { label: 'Isabelle', person: 'il' },
  { label: 'Le prof', person: 'il' },
  { label: 'Nous', person: 'nous' },
  { label: 'Vous', person: 'vous' },
  { label: 'Monsieur, vous', person: 'vous' },
  { label: 'Ils', person: 'ils' },
  { label: 'Elles', person: 'ils' },
  { label: 'Les filles', person: 'ils' },
];

// Draaiboek p.22-25: vocabulaire chapitre 1, delen A, B, E, F.
// Per part: left column first (1-10), then right column (11-20).
// Format: French as printed | Dutch as printed | optional gender marker.
const VOCAB_SOURCE: Record<VocabPart, [string, string, string?][]> = {
  A: [
    ['la rentrée', 'de eerste schooldag'],
    ['rencontrer', 'ontmoeten'],
    ["l'ami(e)", 'de vriend(in)'],
    ['le frère', 'de broer'],
    ['le/la jeune', 'de jongere'],
    ['la découverte', 'de ontdekking'],
    ['en avion', 'met het vliegtuig'],
    ['en train', 'met de trein'],
    ['en bateau', 'met de boot'],
    ['en voiture', 'met de auto'],
    ['pourquoi', 'waarom'],
    ['parce que', 'omdat'],
    ['mais', 'maar'],
    ['incroyable', 'ongelofelijk'],
    ['content(e)', 'tevreden'],
    ['en Espagne', 'in/naar Spanje', 'v'],
    ['en Allemagne', 'in/naar Duitsland', 'v'],
    ['en Angleterre', 'in/naar Engeland', 'v'],
    ['aux Pays-Bas', 'in/naar Nederland', 'm mv'],
    ['en Belgique', 'in/naar België', 'v'],
  ],
  B: [
    ['le voyage', 'de reis'],
    ['le pays', 'het land'],
    ['la famille', 'de familie'],
    ['la sœur', 'de zus'],
    ['la sortie', 'het uitstapje'],
    ['au début', 'in het begin, eerst'],
    ['ensuite', 'daarna'],
    ['pauvre', 'arm'],
    ['loin', 'ver'],
    ['la météo', 'het weerbericht'],
    ['je crois', 'ik geloof'],
    ['je prends', 'ik neem, ik pak'],
    ["j'ai peur", 'ik ben bang'],
    ['rester', 'blijven'],
    ['arriver', 'aankomen'],
    ['il fait froid', 'het is koud'],
    ['il fait mauvais', 'het is slecht weer'],
    ['il a plu', 'het heeft geregend'],
    ['il pleut', 'het regent'],
    ['le temps', 'het weer, de tijd'],
  ],
  E: [
    ['tout', 'alles, alle'],
    ['presque', 'bijna'],
    ['trop', 'te, te veel'],
    ["d'abord", 'ten eerste, eerst'],
    ['enfin', 'eindelijk'],
    ['au printemps', 'in de lente'],
    ['en été', 'in de zomer'],
    ['en automne', 'in de herfst'],
    ['en hiver', 'in de winter'],
    ['toujours', 'altijd'],
    ['je veux', 'ik wil'],
    ["à l'étranger", 'in het buitenland', 'm'],
    ['fatigué(e)', 'moe'],
    ['voyager', 'reizen'],
    ['la ville', 'de stad'],
    ['néerlandais', 'Nederlands'],
    ['anglais', 'Engels'],
    ['allemand', 'Duits'],
    ['espagnol', 'Spaans'],
    ['français', 'Frans'],
  ],
  F: [
    ["l'endroit", 'de plek', 'm'],
    ["l'eau", 'het water', 'v'],
    ['la mer', 'de zee'],
    ['la piscine', 'het zwembad'],
    ['voici', 'hier is/zijn'],
    ['faire du camping', 'kamperen'],
    ["l'excursion", 'de excursie', 'v'],
    ['le séjour', 'het verblijf'],
    ["l'activité", 'de activiteit', 'v'],
    ['la semaine', 'de week'],
    ['sur', 'op'],
    ['aussi', 'ook'],
    ['découvrir', 'ontdekken'],
    ['visiter', 'bezoeken'],
    ['proposer', '(iets) voorstellen'],
    ['la montagne', 'de berg'],
    ['le château', 'het kasteel'],
    ["l'escalade", 'het klimmen', 'v'],
    ['faire les magasins', 'winkelen'],
    ['la soirée', 'de avond'],
  ],
};

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const vocab: VocabItem[] = (Object.keys(VOCAB_SOURCE) as VocabPart[]).flatMap((part) =>
  VOCAB_SOURCE[part].map(([fr, nl, gender]) => ({ id: `${part}-${slug(fr)}`, part, fr, nl, gender })),
);
