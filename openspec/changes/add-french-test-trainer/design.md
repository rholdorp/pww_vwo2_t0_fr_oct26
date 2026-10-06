# Design

## Context

- Greenfield: de repo bevat alleen een README en de OpenSpec-setup. Op de ontwikkelmachine staan Node 26 en de Firebase CLI 15.19.
- Er is nog geen Firebase-project; de ouder maakt dat aan in de console (zie Migration Plan) en logt de CLI in. De rest gebeurt in de repo.
- Harde deadline: de toets is maandag 12 oktober 2026, de app moet woensdag 7 oktober bruikbaar zijn. Eenvoud en snelheid van bouwen wegen zwaarder dan uitbreidbaarheid.
- Bron van de lesstof: `V2_ Draaiboek oktober 2025 Grammatica VERSION ELEVE.pdf` (blz. 4-5 regels en werkwoordenlijst, 8 onregelmatige ww, 14 en 17 passé composé, 22-25 vocabulaire).
- Gebruik: 2-3 sessies van ~15 minuten per dag op telefoon (iOS/Android) en laptop.

## Goals / Non-Goals

**Goals:**
- Eén statische web-app (PWA) die offline werkt en via Firebase Hosting op één URL bereikbaar is.
- Alle nakijk-, niveau- en planningslogica als pure, geteste functies, los van de UI.
- Voortgang gebaseerd op een append-only antwoordlogboek, zodat offline oefenen op meerdere apparaten nooit data verliest.

**Non-Goals:**
- Echte authenticatie of bescherming tegen iemand die andermans naam intypt (bewust geaccepteerd).
- Docent-/klasbeheer, meerdere toetsen kiezen in de UI, ranglijsten.
- Uitspraak/audio, spraakherkenning, leesteksten.
- Een beheer-UI om lesstof te bewerken; het inhoudspakket is een bestand in de repo.

## Decisions

### D1. Vite + TypeScript + Preact, één pagina
Preact (≈4 kB) houdt de app snel op een oudere telefoon en geeft componenten zonder het gewicht van React. Vite geeft snelle builds en een eenvoudige PWA-plugin.
*Alternatieven:* vanilla JS (meer handwerk voor de schermen), React (zwaarder, geen voordeel hier), Svelte (prima, maar minder bekend terrein voor onderhoud).

### D2. Lesstof als getypeerd inhoudspakket in de repo
`src/content/pww-oct26.ts` exporteert één object: metadata (titel, toetsdatum 2026-10-12), werkwoorden (infinitief, NL-betekenissen, elisie ja/nee, spellingsvarianten, uitgesloten-in-PC), onregelmatige vormen, vocabulaire (FR met lidwoord, NL-betekenissen, deel A/B/E/F), uitlegteksten en de lessenvolgorde. Vervoegingen van regelmatige werkwoorden worden door een functie gegenereerd uit stam + uitgang, met expliciete overrides (mangeons, changeons, commençons, achète-reeks, préfère-reeks, paie/paye-reeks, essaie/essaye-reeks). Een TypeScript-bestand in plaats van JSON levert typecontrole op tijdens het overnemen.
*Alternatief:* lesstof in Firestore. Afgewezen: dan is er een netwerk nodig voor de eerste keer laden, en de stof verandert niet tijdens het oefenen.

### D3. Item-model: deelvaardigheden in plaats van losse vormen
Item-ID's zijn stabiele strings, bijvoorbeeld `voc:A:la-rentree:fr2nl`, `mean:manger:nl2fr`, `end:pres:nous`, `spell:manger:nous`, `irr:pres:aller:ils`, `pc:rule`, `pc:part:etre`, `pc:aux:nous`. Een vraag verwijst naar één of meer items. De verdeling over de blokken: blok 1 = mean + end + spell + irr:pres (incl. avoir); blok 2 = pc:rule + pc:part + pc:aux; blok 3 = voc. Zo blijft blok 1 ≈ 50 + 6 + ~12 + 24 items, blok 2 = 10 items, blok 3 = 160 items, en zijn de percentages per blok betekenisvol.

### D4. Nakijken en diagnose als pure functies
`normalize()` past de regels voor opmaak toe (lowercase, trim, spaties samenvoegen, `’`→`'`) maar laat accenten staan. `check(question, answer)` geeft `{correct, perItem: {itemId: boolean}, diff, explanationKey}`. Diagnose van een toetszin: vergelijk de stam van het antwoord met de stam van het verwachte werkwoord (en van de andere 24 werkwoorden). Komt de stam overeen, dan is de betekenis goed en wordt de uitgang beoordeeld; anders is de betekenis fout en wordt de uitgang niet beoordeeld. Bij de passé composé wordt het antwoord gesplitst in hulpwerkwoord en deelwoord.

### D5. Append-only antwoordlogboek in Firestore, niveaus client-side berekend
```
learners/{nameKey}                    { displayName, createdAt, lastActive, summary }
learners/{nameKey}/answers/{autoId}   { items: {itemId: bool}, ms, fast, at, sessionId, mode }
learners/{nameKey}/tests/{autoId}     { at, score, total, grade, durationMs }
```
Het niveau per item wordt client-side bepaald door de antwoorden van dat item op tijdsvolgorde af te spelen (regels uit de spec). Antwoorden worden alleen aangemaakt, nooit gewijzigd, dus twee apparaten kunnen niet conflicteren. Volume is klein (orde 2.000 antwoorden per leerling), dus alles in het geheugen afspelen is goedkoop. `summary` (percentages, laatste cijfer) wordt na elke sessie bijgewerkt voor de overzichtspagina, zodat die niet alle logboeken hoeft te lezen.
*Alternatief:* per item een document met het huidige niveau. Afgewezen: last-write-wins verliest offline voortgang en vereist transacties.

### D6. Naam → `nameKey`, Firebase Anonymous Auth op de achtergrond
`nameKey` = genormaliseerde naam (lowercase, trim, spaties → `-`, diacrieten weg). Anonymous Auth zorgt alleen dat Firestore-regels `request.auth != null` kunnen eisen; de identiteit is de `nameKey`, niet de uid. De naam staat in `localStorage`.

### D7. Firestore-regels
Lezen/schrijven alleen met `request.auth != null`; `nameKey` moet aan `^[a-z0-9-]{2,20}$` voldoen; `answers` en `tests` alleen `create` (geen update/delete) met validatie van velden en groottes; het learner-document mag aangemaakt en bijgewerkt worden. Dit voorkomt geen misbruik door iemand met de URL, maar wel per ongeluk wissen en rommeldata.

### D8. Offline: vite-plugin-pwa + Firestore persistent cache
Workbox precachet alle app-bestanden (inclusief het inhoudspakket); manifest met naam en icoon voor installeren. Firestore draait met `persistentLocalCache` en `persistentMultipleTabManager`, zodat schrijfacties offline in de wachtrij komen en vanzelf worden verstuurd. Het aantal niet-verstuurde antwoorden wordt bijgehouden via `hasPendingWrites` op de snapshots van de eigen antwoorden. Update-strategie: `autoUpdate`, de nieuwe versie wordt bij de volgende start actief.

### D9. Planning
Lessenvolgorde (in het inhoudspakket):
1. avoir + être présent · vocab A (1-10)
2. -er regel présent · ww 1-8 · vocab A (11-20)
3. faire + aller présent · ww 9-17 · vocab B (1-10)
4. ww 18-25 + spellingsvarianten · vocab B (11-20)
5. passé composé regel + été/eu/fait · vocab E (1-10)
6. toetszinnen gemengd · vocab E (11-20)
7. vocab F (1-20)

Dagdoel = resterende lessen ÷ (resterende dagen − 1); de dag vóór de toets is voor herhalen en proeftoetsen. Herhalingsselectie: prioriteit = (4 − niveau) × gewicht + tijd sinds laatst gezien, waarbij items met een recente fout een bonus krijgen. Een fout item wordt opnieuw ingepland na 3-5 vragen.

### D10. Hosting en workflow
Firebase Hosting (`dist/`), regio Firestore `europe-west4`. Deploy met `firebase deploy`. Kleine, frequente commits en pushes naar `origin`, uitsluitend onder de lokale git-identiteit van de ouder (rholdorp), zonder co-author- of tool-attributieregels.

### D11. Tests
Vitest voor de pure logica: vervoegingsgenerator tegen een vaste tabel met alle 25 werkwoorden × 6 personen × 2 tijden, nakijken (alle scenario's uit `answer-checking`), niveau-afspelen, percentages, planning. UI wordt handmatig in de browser gecontroleerd (telefoonformaat en desktop).

## Risks / Trade-offs

- [Fout bij het overnemen van de lesstof uit de PDF leert iets verkeerds aan] → Volledige vervoegingstabel als test; vocabulaire wordt na overname regel voor regel naast de PDF gecontroleerd en de ouder kijkt de lijst na.
- [Iemand typt de naam van een ander en verpest diens voortgang] → Bewust geaccepteerd (geen pin). Het logboek is append-only, dus foute antwoorden zijn achteraf terug te vinden.
- [De docent rekent anders dan de app (bijv. accentfouten half goed, paie vs paye)] → Strenge standaard is veiliger voor de toets; afwijkingen zijn één regel in het inhoudspakket of de nakijkfunctie.
- [Anonymous Auth kan niet inloggen bij de allereerste start zonder netwerk] → Het eerste bezoek is per definitie online; daarna blijft de anonieme sessie bewaard.
- [iOS ruimt PWA-opslag op na lange tijd niet gebruiken] → Alles staat ook in Firestore; na opnieuw openen wordt het logboek opnieuw opgehaald.
- [Krappe tijd] → Volgorde in de taken: eerst inhoud + nakijken + een werkende oefensessie (dag 1), daarna dashboard, planning, proeftoets en overzicht.

## Migration Plan

1. Ouder (eenmalig): Firebase-project aanmaken (Spark, Analytics uit), web-app registreren met Hosting, Anonymous Auth aanzetten, Firestore aanmaken in `europe-west4` in production mode, `firebase login`. Het project-ID en de `firebaseConfig` worden aangeleverd.
2. Repo: `firebase.json`, `.firebaserc`, `firestore.rules` en de config toevoegen; `firebase deploy --only firestore:rules,hosting`.
3. Rollback: `firebase hosting:rollback` naar de vorige versie; de data in Firestore blijft ongewijzigd.
