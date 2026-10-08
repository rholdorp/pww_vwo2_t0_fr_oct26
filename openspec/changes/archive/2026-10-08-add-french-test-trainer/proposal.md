# Proposal

## Why

Stijn (VWO 2) heeft maandag 12 oktober 2026 een proefwerk Frans en moet een groot deel van de stof nog leren. Het draaiboek (`V2_ Draaiboek oktober 2025 Grammatica VERSION ELEVE.pdf`) somt de stof op, maar helpt niet bij het leren, overhoren en automatiseren. Er zijn nog ~5 oefendagen, dus er is een trainer nodig die vandaag of morgen bruikbaar is, op telefoon én laptop werkt en laat zien hoeveel van de stof hij beheerst en hoe diep.

## What Changes

- Nieuwe web-app (installeerbaar, ook offline bruikbaar) die de toetsstof aanbiedt als leerpad: eerst uitleg en rijtjes, daarna overhoren, daarna automatiseren op snelheid.
- Lesstof uit het draaiboek, vastgelegd als één los inhoudsbestand voor deze toets:
  - Blok 1: présent van 25 regelmatige -er werkwoorden (incl. betekenis NL↔FR) en van être, avoir, faire, aller.
  - Blok 2: passé composé (avoir + voltooid deelwoord) van de -er werkwoorden en van être, avoir, faire.
  - Blok 3: vocabulaire chapitre 1, delen A, B, E, F (80 woorden, beide richtingen).
- Inloggen met alleen een zelfverzonnen naam (geen wachtwoord, geen pin); de naam wordt per apparaat onthouden. Meerdere leerlingen kunnen de app gebruiken, elk met eigen voortgang.
- Voortgang wordt per antwoord vastgelegd en gedeeld tussen apparaten (Firebase), ook als er offline geoefend is.
- Beheersing per item in niveaus (nieuw → herkent → typt goed → typt snel → blijft hangen); dashboard toont per blok "% beheerst" en "% geautomatiseerd".
- Dagplan dat de stof verdeelt over de dagen tot de toetsdatum, in sessies van ~15 minuten.
- Proeftoets in het formaat van de toets ("Nous (kopen) ___ ___"), met tijd en cijfer.
- Overzichtspagina met alle namen en hun voortgang (zo kan een ouder meekijken).
- Strenge nakijkregels: accenten en elisie (j') tellen mee; accentknoppen op de telefoon.
- Bewuste inhoudskeuzes waar het draaiboek correct Frans afwijkt: spellingsvormen als *mangeons*, *commençons*, *achète*, *préfère*, *paie/paye* worden correct aangeleerd; *arriver* en *rentrer* worden niet gevraagd in de passé composé (die gaan met *être*, wat buiten de stof valt).

## Capabilities

### New Capabilities

- `learner-identity`: inloggen met een zelfverzonnen naam, onthouden per apparaat, wisselen van naam.
- `study-content`: de toetsstof als inhoudspakket: werkwoorden, vervoegingen, uitzonderingen, woordenlijsten, uitleg, lessenvolgorde en toetsdatum.
- `answer-checking`: hoe antwoorden worden nagekeken (accenten, elisie, alternatieven, lidwoorden) en welke feedback de leerling krijgt.
- `mastery-tracking`: vastleggen van antwoorden, berekenen van het beheersingsniveau per item en de percentages per blok, gedeeld tussen apparaten.
- `practice-sessions`: het leerpad en dagplan, de samenstelling van een oefensessie en welke vraagvorm bij welk niveau hoort.
- `practice-test`: de proeftoets in toetsformaat met tijd, cijfer en terugkoppeling naar de oefenstapel.
- `progress-overview`: het persoonlijke dashboard en de overzichtspagina van alle leerlingen.
- `offline-access`: installeerbaar op home-screen, bruikbaar zonder netwerk, later synchroniseren.

### Modified Capabilities

(geen; er bestaan nog geen specs)

## Impact

- Nieuw project, er is nog geen code: frontend-app, build-configuratie, tests en Firebase-configuratie (hosting, Firestore-regels).
- Externe dienst: nieuw Firebase-project (Spark/gratis plan) met Anonymous Authentication, Firestore (regio Europa) en Hosting. De ouder maakt het project aan en logt in met de CLI; de app-configuratie komt daarna in het project.
- Opslag van gegevens van minderjarigen: alleen een zelfgekozen naam en oefenresultaten, geen e-mail of andere persoonsgegevens, geen analytics.
- Lesstof is met de hand overgenomen uit het draaiboek (PDF blz. 4-25); fouten bij het overnemen hebben direct invloed op wat er wordt aangeleerd.
