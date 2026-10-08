# Tasks

Werkafspraak: na elke afgeronde taak een kleine commit en push naar `origin`, uitsluitend onder de git-identiteit rholdorp, zonder co-author- of tool-attributieregels.

## 1. Engine

- [x] 1.1 `buildVocabRound` in `src/engine/vocabRound.ts` (design D1); controleren met Vitest-tests: een deel geeft 20 typvragen met elk woordpaar van dat deel precies één keer, beide richtingen komen voor over meerdere rondes, en "alles" kiest bij een sterk deel A en zwak deel F vooral woorden uit F
- [x] 1.2 Lesstart alleen op grammatica-items, woordlessen op woorden (design D2) in `isIntroduced` en `introducedAt`; controleren met Vitest-tests voor beide scenario's uit de spec "Grammaticapad blijft intact" en dat alle bestaande tests groen blijven

## 2. Scherm en dashboard

- [ ] 2.1 `VocabTrainer`-scherm met ronde, typvragen via `QuestionView`, opslaan van elk antwoord en samenvatting met score, tijd en foute woorden (design D3); controleren in de browser tegen de emulator: een ronde van deel B afmaken met een paar bewuste fouten en de samenvatting nalopen
- [ ] 2.2 Kaart "Woordjes" op het dashboard met knoppen A, B, E, F en de link "alles door elkaar", route in `LearnerApp`, en een korte beschrijving in `README.md` onder "Gebruik"; controleren in de browser op 375px en desktop dat één tik de ronde start en dat de percentages van blok 3 na een ronde stijgen

## 3. Publiceren

- [ ] 3.1 `npm test` en `npm run build` draaien en daarna `firebase deploy --only hosting`; controleren dat de gepubliceerde app de woordjeskaart toont en een ronde start (zonder in te loggen met een echte naam, of met een testnaam die daarna wordt verwijderd)
