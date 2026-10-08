# practice-sessions Specification

## Purpose

Een leerling die nog bij nul begint in korte sessies door de stof leiden: eerst nieuwe stof leren, dan overhoren, dan automatiseren, verdeeld over de dagen tot de toets.

## Requirements

### Requirement: Lessen in vaste volgorde
Het systeem SHALL nieuwe stof aanbieden in de lessenvolgorde uit het inhoudspakket, waarbij avoir en être in de présent vóór de passé composé komen en de présent-regel vóór de toetszinnen. Vocabulaire wordt in porties per deel (A, B, E, F) naast de grammatica aangeboden.

#### Scenario: Passé composé pas na avoir
- **WHEN** de leerling de les over avoir in de présent nog niet heeft gehad
- **THEN** biedt het systeem nog geen passé-composé-les aan

### Requirement: Volgende les pas na beheersing
Het systeem SHALL een nieuwe les pas automatisch aanbieden als minstens 80% van de items uit de eerder aangeboden lessen op niveau 2 of hoger staat. De leerling SHALL zelf eerder door kunnen gaan.

#### Scenario: Nog niet genoeg beheerst
- **WHEN** 60% van de items uit de aangeboden lessen op niveau 2 of hoger staat
- **THEN** besteedt de volgende sessie zijn tijd aan herhalen in plaats van een nieuwe les

#### Scenario: Zelf doorgaan
- **WHEN** de leerling kiest voor "Volgende les"
- **THEN** biedt het systeem de volgende les aan, ook als de 80% nog niet is gehaald

### Requirement: Dagplan tot de toetsdatum
Het systeem SHALL de nog niet aangeboden lessen verdelen over de resterende dagen tot de toetsdatum, met de laatste dag vóór de toets voor herhalen en proeftoetsen, en op het dashboard tonen wat het doel voor vandaag is.

#### Scenario: Achterstand
- **WHEN** de leerling een dag niet heeft geoefend
- **THEN** verdeelt het systeem de resterende lessen opnieuw over de resterende dagen en toont het een groter dagdoel

### Requirement: Sessie van ongeveer 15 minuten
Het systeem SHALL een oefensessie samenstellen van ongeveer 15 minuten met eerst eventuele nieuwe stof en daarna herhaling. Zwakke en lang niet geziene items krijgen bij de herhaling voorrang. Elk antwoord wordt direct bewaard, zodat de leerling op elk moment kan stoppen.

#### Scenario: Na 15 minuten
- **WHEN** de leerling 15 minuten bezig is in een sessie
- **THEN** sluit het systeem de sessie af na de huidige vraag met een samenvatting en de keuze om door te gaan

### Requirement: Leren van nieuwe stof
Het systeem SHALL een nieuwe les beginnen met de uitleg en het rijtje of de woorden uit het inhoudspakket, gevolgd door een invuloefening in de vorm van het draaiboek (bijvoorbeeld de zes personen van een werkwoord invullen).

#### Scenario: Les avoir
- **WHEN** de leerling de les "avoir in de présent" begint
- **THEN** ziet hij eerst het rijtje j'ai, tu as, il a, nous avons, vous avez, ils ont en vult hij daarna de zes vormen zelf in

### Requirement: Vraagvorm groeit mee met het niveau
Het systeem SHALL een item op niveau 0 als meerkeuzevraag aanbieden en vanaf niveau 1 als typvraag. Toetszinnen als "Les filles (geven)" worden aangeboden als de betekenis van het werkwoord en de betrokken uitgang op niveau 2 of hoger staan.

#### Scenario: Nieuw woord
- **WHEN** het woord "la mer" nog op niveau 0 staat
- **THEN** krijgt de leerling een meerkeuzevraag met vier opties

#### Scenario: Toetszin vrijgespeeld
- **WHEN** de betekenis van donner en de uitgang bij ils/elles op niveau 2 staan
- **THEN** kan het systeem de vraag "Les filles (geven)" stellen

### Requirement: Fout antwoord komt snel terug
Het systeem SHALL een fout beantwoord item binnen dezelfde sessie na enkele andere vragen opnieuw aanbieden.

#### Scenario: Herkansing
- **WHEN** de leerling "Vous (praten)" fout beantwoordt
- **THEN** krijgt hij die vraag na 3 tot 5 andere vragen opnieuw

### Requirement: Accentknoppen
Het systeem SHALL bij typvragen in het Frans knoppen voor é, è, ê, à, ç en ' tonen die het teken op de cursorpositie invoegen.

#### Scenario: Accent invoegen op telefoon
- **WHEN** de leerling bij een typvraag op de knop "é" tikt
- **THEN** wordt "é" op de cursorpositie in het antwoordveld ingevoegd en blijft het toetsenbord open
