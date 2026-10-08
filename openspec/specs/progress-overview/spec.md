# progress-overview Specification

## Purpose

De leerling en zijn ouders in één oogopslag laten zien hoeveel van de stof beheerst en geautomatiseerd is en wat er vandaag nog moet gebeuren.

## Requirements

### Requirement: Dashboard met voortgang per blok
Het systeem SHALL op het dashboard van de leerling per blok en voor het totaal "% beheerst" en "% geautomatiseerd" tonen, samen met het aantal dagen tot de toets.

#### Scenario: Dashboard openen
- **WHEN** Stijn het dashboard opent op donderdag 8 oktober 2026
- **THEN** ziet hij per blok twee percentages, het totaal en "nog 4 dagen tot de toets"

### Requirement: Dagdoel en starten
Het systeem SHALL op het dashboard het doel voor vandaag tonen (welke lessen en hoeveel sessies) en knoppen om een oefensessie of een proeftoets te starten.

#### Scenario: Dagdoel gehaald
- **WHEN** de leerling vandaag de geplande lessen heeft afgerond en twee sessies heeft gedaan
- **THEN** toont het dashboard dat het dagdoel is gehaald en kan hij nog steeds extra oefenen

### Requirement: Zwakke punten
Het systeem SHALL op het dashboard de items tonen die het vaakst fout gaan, zodat de leerling ziet waar hij nog op moet letten.

#### Scenario: Terugkerende fout
- **WHEN** de leerling de vorm "nous mangeons" drie keer fout heeft beantwoord
- **THEN** staat "manger - nous" bij de zwakke punten op het dashboard

### Requirement: Overzicht van alle leerlingen
Het systeem SHALL een overzichtspagina bieden, bereikbaar vanaf het naamscherm en het dashboard, met per naam de percentages per blok, de laatste oefendatum en het laatste proeftoetscijfer.

#### Scenario: Ouder kijkt mee
- **WHEN** een ouder op een eigen apparaat de overzichtspagina opent
- **THEN** ziet hij de voortgang van "Stijn" en van andere leerlingen zonder als een van hen in te loggen
