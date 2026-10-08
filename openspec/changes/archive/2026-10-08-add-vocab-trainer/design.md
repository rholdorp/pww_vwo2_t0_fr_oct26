# Design

## Context

- De app uit `add-french-test-trainer` draait live. Vocabulaire-items hebben de vorm `voc:{woordId}:{fr2nl|nl2fr}` en zitten verdeeld over de lessen 1-7 (`src/content/pww-oct26.ts`).
- Een les telt nu als begonnen zodra één van zijn items een `firstSeen` heeft (`isIntroduced` en `introducedAt` in `src/engine/session.ts`). Lessen 1-5 mengen grammatica en woorden; les 6 heeft alleen woorden (met uitleg over toetszinnen); les 7 heeft alleen woorden.
- `QuestionView` doet al wat de trainer nodig heeft: typvraag, accentknoppen, nakijken via `check()`, groen bij goed en automatisch door, bij fout het gemarkeerde juiste antwoord met een "Verder"-knop.
- `useLearner().record()` slaat antwoorden op en bepaalt "snel" (5 s voor een woord).
- Krappe tijd: de toets is maandag 12 oktober, dus dit moet vandaag of morgen live.

## Goals / Non-Goals

**Goals:**
- Een woordronde als pure, geteste functie; het scherm hergebruikt `QuestionView`.
- Geen wijziging aan datamodel, Firestore-regels of lesstof.

**Non-Goals:**
- De zinnen (phrases-clés).
- Een richtingkeuze, meerkeuze in de trainer, of rondes met herkansing.
- Bijhouden van beste scores of tijden per deel (de score is alleen zichtbaar aan het eind van de ronde).

## Decisions

### D1. Ronde-samenstelling in `src/engine/vocabRound.ts`
`buildVocabRound(pack, part | 'all', states, rng): VocabQuestion[]`
- Deel: de 20 woorden van dat deel, geschud.
- `'all'`: alle 80 woorden, gesorteerd op het laagste niveau van de twee richtingen (oplopend), met een willekeurige tiebreak; de eerste 20, daarna geschud. Zo komen zwakke woorden voor, maar niet altijd in dezelfde volgorde.
- Per woord een willekeurige richting. Elke vraag krijgt `mode: 'type'`.
*Alternatief:* `questionFor()` uit `generate.ts` hergebruiken. Afgewezen: die kiest de vraagvorm op niveau (meerkeuze bij niveau 0), terwijl de trainer altijd typt; een eigen kleine bouwer is eenvoudiger dan een uitzondering in `questionFor()`.

### D2. Lesstart alleen op grammatica-items
In `session.ts` krijgt elke les een "startset": de items die niet met `voc:` beginnen; is die leeg (les 6 en 7), dan alle items. `isIntroduced` en `introducedAt` kijken alleen naar de startset. `candidateItems` blijft gebaseerd op begonnen lessen plus recente fouten; woorden uit de trainer komen dus niet ongevraagd in de grammaticasessie, maar woorden van een begonnen les wel.
*Alternatief:* trainerantwoorden een eigen `mode` geven (zoals `test`) en die uitsluiten van `firstSeen`. Afgewezen: dat vereist een wijziging van de Firestore-regels (toegestane `mode`-waarden) en een deploy van regels, terwijl de startset-aanpak het probleem bij de oorsprong oplost.
*Effect op bestaande voortgang:* lessen 1-5 die al begonnen zijn, hebben ook grammatica-antwoorden (de invultabel), dus ze blijven begonnen.

### D3. Scherm `src/ui/VocabTrainer.tsx` en route
Nieuwe route `{ name: 'vocab', part: VocabPart | 'all' }` in `LearnerApp`. Het scherm houdt de ronde, de huidige index, de starttijd en per vraag het resultaat bij. Per antwoord `learner.record(q, r, ms, 'type', sessionId)`. Aan het eind een samenvatting met score, tijd (mm:ss) en foute woorden (`fr = nl`), met "Nog een ronde" (nieuwe ronde, zelfde keuze) en "Klaar".

### D4. Dashboard
Een kaart "Woordjes" met vier gelijke knoppen A, B, E, F op één rij (ook op 375px) en daaronder een `link`-knop "alles door elkaar". Het bestaande effect in `LearnerApp` werkt de samenvatting voor het overzicht bij zodra de leerling terug is op het dashboard.

## Risks / Trade-offs

- [Typen zonder meerkeuze bij onbekende woorden geeft lage eerste scores] → Bewust gekozen door Stijn; het juiste antwoord verschijnt direct, en de score laat zien wat hij echt kent.
- [Een fout in de trainer zet het niveau van het woord omlaag, dus het komt vaker terug in de gewone sessie] → Gewenst gedrag: zwakke woorden krijgen voorrang.
- [Woorden van een nog niet begonnen les die in de trainer fout gaan, komen via "recente fouten" (48 uur) in de grammaticasessie] → Acceptabel en in lijn met het bestaande gedrag na een proeftoets.

## Migration Plan

Na de taken: `npm test`, `npm run build`, `firebase deploy --only hosting`. Apparaten krijgen de nieuwe versie bij de volgende start. Terugdraaien kan via Hosting in de Firebase-console; de data verandert niet van vorm.
