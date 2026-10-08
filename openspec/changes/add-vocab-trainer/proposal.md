# Proposal

## Why

Stijn wil de woordjes los van de grammatica kunnen "knallen". Nu komen de 80 woorden van chapitre 1 alleen voorbij als onderdeel van de grammaticalessen, in porties per les. Deel F kan hij bijvoorbeeld pas oefenen na les 7. Met nog 3 oefendagen tot de toets (maandag 12 oktober 2026) wil hij per deel snel en gericht kunnen stampen, met een score als graadmeter.

## What Changes

- Nieuwe woordjestrainer, los van de oefensessie en de proeftoets, te starten vanaf het dashboard.
- Per deel kiezen: A, B, E of F. Eén tik start direct een ronde, zonder verdere instellingen.
- Een ronde van een deel bevat de 20 woordparen van dat deel, elk precies één keer, in willekeurige volgorde.
- De richting wordt per woord willekeurig gekozen (FR → NL of NL → FR). Er is geen richtingkeuze.
- Altijd typen, nooit meerkeuze. Een fout antwoord toont direct het juiste antwoord en komt niet terug in dezelfde ronde.
- Aan het eind: score "x / 20", de tijd en de lijst met foute woorden, met de keuze voor nog een ronde.
- Extra optie "alles", niet als standaard: een ronde van 20 woorden uit alle delen, de zwakste eerst.
- Antwoorden uit de trainer tellen mee voor de beheersing van blok 3 (Vocabulaire).
- Het grammaticapad blijft intact: woorden oefenen in de trainer laat een grammaticales niet als "begonnen" tellen.
- Buiten scope: de zinnen (phrases-clés) van blz. 50-51. Die zijn volgens het draaiboek geen toetsstof ("alleen de woorden").

## Capabilities

### New Capabilities

- `vocab-trainer`: de losse woordjestrainer: deelkeuze, samenstelling van een ronde, typvragen in gemengde richting, score aan het eind, en hoe trainerantwoorden meetellen zonder het grammaticapad te verstoren.

### Modified Capabilities

(geen: de specs van `add-french-test-trainer` zijn nog niet gearchiveerd naar `openspec/specs/`; het gedrag rond het grammaticapad wordt daarom als eis van `vocab-trainer` vastgelegd)

## Impact

- Frontend: nieuwe knoppen op het dashboard, een nieuw scherm voor de trainer en een nieuwe route in de app.
- Engine: samenstelling van een woordronde (nieuw), en een aanpassing in hoe een les als "begonnen" telt (`src/engine/session.ts`), met tests.
- Geen wijzigingen aan de lesstof, aan Firestore-regels of aan het datamodel: trainerantwoorden worden als gewone typantwoorden opgeslagen.
- Bestaande voortgang blijft geldig. Item-ID's veranderen niet.
- Deploy via `firebase deploy --only hosting` na afronding.
