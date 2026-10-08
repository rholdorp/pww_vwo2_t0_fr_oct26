# Spec Delta

## Purpose

Een losse woordjestrainer waarmee de leerling per deel van de vocabulaire snel en gericht kan stampen, met een score per ronde, los van de grammatica.

## ADDED Requirements

### Requirement: Starten per deel
Het systeem SHALL op het dashboard een knop per vocabulairedeel (A, B, E, F) tonen. Eén tik op een deel start direct een ronde van dat deel, zonder verdere instellingen. Alle delen zijn altijd beschikbaar, ook als de bijbehorende grammaticales nog niet is gedaan.

#### Scenario: Deel F vóór les 7
- **WHEN** de leerling nog maar les 1 heeft gedaan en op "F" tikt
- **THEN** start het systeem direct een ronde met de woorden van deel F

### Requirement: Ronde van een deel
Het systeem SHALL in een ronde van een deel elk van de 20 woordparen van dat deel precies één keer vragen, in willekeurige volgorde.

#### Scenario: Alle woorden één keer
- **WHEN** de leerling een ronde van deel B volledig afmaakt
- **THEN** heeft hij 20 vragen gehad en kwam elk woordpaar van deel B precies één keer voor

### Requirement: Gemengde richting
Het systeem SHALL per woord in een ronde willekeurig kiezen tussen Frans → Nederlands en Nederlands → Frans. De leerling kan de richting niet instellen.

#### Scenario: Beide richtingen in één ronde
- **WHEN** de leerling een ronde van 20 woorden doet
- **THEN** komen in die ronde vragen in beide richtingen voor, behalve bij toeval

### Requirement: Altijd typen
Het systeem SHALL elke vraag in de trainer als typvraag stellen, ook voor woorden die de leerling nog nooit heeft gezien, met de nakijkregels van de app (lidwoord en accenten streng in het Frans, soepel in het Nederlands) en de accentknoppen bij Franse antwoorden.

#### Scenario: Nieuw woord
- **WHEN** een woord nog op niveau 0 staat en in een trainerronde voorkomt
- **THEN** krijgt de leerling een typvraag en geen meerkeuzevraag

### Requirement: Fout antwoord in de trainer
Het systeem SHALL bij een fout antwoord direct het juiste antwoord tonen, met de gemarkeerde fout, en het woord niet opnieuw vragen in dezelfde ronde.

#### Scenario: Fout en door
- **WHEN** de leerling bij "la sortie" "de uitgang" invult
- **THEN** toont het systeem "het uitstapje" en blijft de ronde op 20 vragen

### Requirement: Score aan het eind
Het systeem SHALL na de laatste vraag van een ronde de score als "x / 20" tonen, de tijd die de ronde duurde, en de foute woorden met hun juiste vertaling, met de keuze voor nog een ronde van hetzelfde deel of terug naar het dashboard.

#### Scenario: Ronde klaar
- **WHEN** de leerling deel B afrondt met 16 goed in 1 minuut en 48 seconden
- **THEN** toont het systeem "16 / 20", "1:48" en de 4 foute woorden met de juiste vertaling

### Requirement: Optie alles
Het systeem SHALL naast de delen een minder prominente optie "alles" bieden, die een ronde van 20 woordparen uit alle delen samenstelt, waarbij de woorden met het laagste beheersingsniveau voorgaan.

#### Scenario: Alles door elkaar
- **WHEN** de leerling deel A goed beheerst maar deel F nog niet en "alles" kiest
- **THEN** bestaat de ronde van 20 vooral uit woorden van deel F

### Requirement: Telt mee voor de voortgang
Het systeem SHALL elk antwoord uit de trainer vastleggen zoals andere getypte antwoorden, zodat het meetelt voor de beheersingsniveaus en voor "% beheerst" en "% geautomatiseerd" van blok 3.

#### Scenario: Voortgang na een ronde
- **WHEN** de leerling in de trainer 20 woorden van deel A goed en snel typt
- **THEN** stijgen de percentages van blok 3 op het dashboard

### Requirement: Grammaticapad blijft intact
Het systeem SHALL een les met grammatica pas als begonnen beschouwen wanneer een grammatica-item van die les is beantwoord. Een les met alleen woorden telt als begonnen zodra een van zijn woorden is beantwoord. Zo slaat het leerpad geen uitleg en invuloefening over door oefenen in de trainer.

#### Scenario: Woorden A in de trainer
- **WHEN** de leerling nog geen les heeft gedaan en in de trainer een ronde van deel A doet
- **THEN** begint de volgende oefensessie nog steeds met de uitleg en invultabel van les 1 (avoir en être)

#### Scenario: Les met alleen woorden
- **WHEN** de leerling alle woorden van deel F in de trainer heeft geoefend
- **THEN** telt les 7 (woorden F) als begonnen in het dagplan
