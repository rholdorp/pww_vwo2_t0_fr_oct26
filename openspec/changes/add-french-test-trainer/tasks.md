# Tasks

Werkafspraak: na elke afgeronde taak (of kleine groep taken) een kleine commit maken en pushen naar `origin`, uitsluitend onder de git-identiteit rholdorp, zonder co-author- of tool-attributieregels (design D10).

## 1. Projectopzet

- [x] 1.1 Vite + TypeScript + Preact-project opzetten met `npm run dev`, `build` en `test` (Vitest); `.gitignore` voor `node_modules`, `dist` en `.DS_Store`; controleren dat `npm run build` en `npm test` slagen
- [x] 1.2 Basislayout voor telefoon en laptop (één kolom, grote invoervelden, Nederlandse teksten); controleren in de browser op 375px en desktopbreedte

## 2. Lesstof (study-content)

- [x] 2.1 Typen voor het inhoudspakket vastleggen (werkwoord, onregelmatige vormen, vocabulaire-item, uitleg, les, metadata); controleren dat `tsc --noEmit` slaagt
- [x] 2.2 De 25 -er werkwoorden met NL-betekenissen, elisie en spellingsvarianten overnemen uit PDF blz. 5, plus être/avoir/faire/aller; arriver/rentrer markeren als uitgesloten in de passé composé
- [x] 2.3 Vervoegingsgenerator voor présent en passé composé met overrides; controleren met een Vitest-tabel van alle 25 werkwoorden × 6 personen × 2 tijden plus de onregelmatige vormen (o.a. mangeons, commençons, j'achète, je préfère, je paie/paye, j'ai été)
- [x] 2.4 De 80 vocabulairewoorden (A, B, E, F) overnemen uit PDF blz. 22-25 met lidwoorden en alle NL-betekenissen; controleren met een test op 4 × 20 items en een handmatige regel-voor-regelvergelijking met de PDF
- [x] 2.5 Uitlegteksten per grammaticaonderdeel en de lessenvolgorde (design D9) toevoegen, plus toetsdatum 2026-10-12; controleren met een test dat elk item in precies één les zit
- [x] 2.6 Item-ID's en blokindeling (design D3) afleiden uit het pakket; controleren met een test op de aantallen per blok

## 3. Nakijken (answer-checking)

- [x] 3.1 `normalize()` en het nakijken van enkelvoudige antwoorden (accenten streng, opmaak soepel, voornaamwoord optioneel, elisie bij je, lidwoord verplicht in het Frans, soepel in het Nederlands); controleren met Vitest-tests voor elk scenario uit de spec `answer-checking`
- [x] 3.2 Diagnose van toetszinnen en passé composé (stamvergelijking, splitsen hulpwerkwoord/deelwoord, uitkomst per item); controleren met tests voor "achetez" en "trouvons" bij "Nous (kopen)"
- [x] 3.3 Verschilmarkering en uitlegsleutel bij een fout antwoord; controleren met tests op de diff voor "cherchons" vs "cherchez" en "je aime" vs "j'aime"

## 4. Voortgang (mastery-tracking) - lokale logica

- [x] 4.1 Niveau-afspelen per item uit een lijst antwoorden (0-4, snelheidsgrenzen 5 s / 8 s, terugval niet onder 1, niveau 4 op een latere kalenderdag); controleren met Vitest-tests voor alle scenario's uit de spec
- [x] 4.2 Percentages "% beheerst" en "% geautomatiseerd" per blok en totaal; controleren met een test op het voorbeeld 80/160 en 40/160

## 5. Firebase en opslag

- [x] 5.1 (Ouder) Firebase-project aanmaken volgens design → Migration Plan stap 1; controleren dat `firebase projects:list` het project toont en dat project-ID en `firebaseConfig` zijn aangeleverd
- [x] 5.2 `firebase.json`, `.firebaserc` en de Firebase-config in de app toevoegen; Anonymous Auth en Firestore met persistent cache initialiseren; controleren in de browser dat een anonieme sessie ontstaat
- [x] 5.3 `firestore.rules` volgens design D7 schrijven en deployen; controleren met de Firestore-emulator of handmatig dat updates/deletes op `answers` worden geweigerd en creates met geldige velden slagen
- [x] 5.4 Opslaglaag: learner-document aanmaken/bijwerken, antwoorden en toetsuitslagen toevoegen, eigen logboek realtime lezen, aantal niet-verstuurde antwoorden bijhouden; controleren dat een antwoord op apparaat A binnen enkele seconden op apparaat B in de voortgang meetelt

## 6. Inloggen met naam (learner-identity)

- [x] 6.1 Naamscherm met validatie (2-20 tekens, toegestane tekens), normalisatie naar `nameKey`, onthouden in `localStorage` en "Wissel van naam"; controleren in de browser dat "Stijn" en "stijn " op dezelfde voortgang uitkomen en dat herladen direct het dashboard opent

## 7. Oefensessies (practice-sessions)

- [x] 7.1 Lesscherm: uitleg + rijtje/woorden, gevolgd door de invuloefening in draaiboekvorm; controleren in de browser met de les "avoir in de présent"
- [x] 7.2 Vraagtypen: meerkeuze (niveau 0), typvraag (niveau ≥1) en toetszin (zodra de betrokken items op niveau ≥2 staan), met antwoordtijdmeting; controleren in de browser dat een nieuw woord als meerkeuzevraag verschijnt
- [x] 7.3 Accentknoppen é è ê à ç ' die op de cursor invoegen zonder het toetsenbord te sluiten; controleren op een echte telefoon (iOS Safari) of in de mobiele emulatie
- [x] 7.4 Sessieopbouw: nieuwe les bij ≥80% beheersing of op verzoek, herhalingsprioriteit, fout item na 3-5 vragen terug, afsluiten na ~15 minuten met samenvatting; controleren met Vitest-tests op de selectiefunctie en een handmatige sessie in de browser
- [x] 7.5 Dagplan: resterende lessen verdelen over de resterende dagen tot de toetsdatum, laatste dag voor herhalen en proeftoetsen; controleren met Vitest-tests voor normaal verloop en een overgeslagen dag

## 8. Dashboard en overzicht (progress-overview)

- [x] 8.1 Dashboard met percentages per blok en totaal, dagen tot de toets, dagdoel, zwakke punten, proeftoetsuitslagen en startknoppen; controleren in de browser met testdata
- [x] 8.2 `summary` op het learner-document bijwerken na elke sessie en toets, en een overzichtspagina met alle leerlingen; controleren door met twee namen te oefenen en het overzicht op een derde apparaat te openen

## 9. Proeftoets (practice-test)

- [x] 9.1 Proeftoets van 40 vragen (10/10/10/10) met onderwerpen zoals in het draaiboek, timer, zonder hulp; controleren met een Vitest-test op de samenstelling en handmatig in de browser
- [x] 9.2 Cijfer (1 + 9 × goed/totaal, één decimaal), nabespreking van fouten met uitleg, uitkomsten in het logboek en uitslag bewaard; controleren met een test op 32/40 → 8,2 en handmatig dat fout beantwoorde items in de volgende sessie terugkomen

## 10. Offline en publicatie (offline-access)

- [x] 10.1 vite-plugin-pwa met manifest (naam, iconen) en precache; controleren dat Lighthouse de app als installeerbaar ziet en dat de app op een telefoon aan het beginscherm toe te voegen is
- [x] 10.2 Offline-melding met aantal niet-verstuurde antwoorden en automatische update bij de volgende start; controleren in de browser met netwerk uit: sessie doen, melding zien, netwerk aan, antwoorden komen aan
- [x] 10.3 Publiceren met `firebase deploy` en de URL plus installatie-instructies (iOS en Android) in `README.md` zetten; controleren dat de gepubliceerde URL op telefoon en laptop werkt

## 11. Eindcontrole

- [ ] 11.1 Volledige doorloop met de naam "test": een les, een sessie op de telefoon offline, dezelfde voortgang op de laptop, een proeftoets en het overzicht; controleren dat alle stappen werken en `npm test` groen is, daarna de testleerling verwijderen via de Firebase-console
