# Spec Delta

## Purpose

De trainer altijd snel bereikbaar maken, ook zonder internet, zodat de leerling overal kan oefenen en niets verliest.

## ADDED Requirements

### Requirement: Installeerbaar op het home-screen
Het systeem SHALL installeerbaar zijn als app op het home-screen van een telefoon (iOS en Android) en op een laptop, en vanaf daar starten zonder adresbalk.

#### Scenario: Toevoegen aan beginscherm
- **WHEN** de leerling de site op zijn telefoon "aan beginscherm toevoegt" en het icoon opent
- **THEN** start de trainer schermvullend met een eigen naam en icoon

### Requirement: Oefenen zonder netwerk
Het systeem SHALL na één eerste bezoek met internet volledig bruikbaar zijn zonder netwerkverbinding: dashboard, lessen, oefensessies en proeftoetsen.

#### Scenario: Oefenen in de bus
- **WHEN** de leerling de app opent zonder internetverbinding
- **THEN** kan hij een oefensessie doen en ziet hij zijn voortgang tot nu toe

### Requirement: Synchroniseren na offline oefenen
Het systeem SHALL antwoorden die offline zijn gegeven bewaren en automatisch versturen zodra er weer verbinding is, zonder actie van de leerling.

#### Scenario: Weer online
- **WHEN** de leerling offline 20 vragen heeft beantwoord en daarna weer internet heeft
- **THEN** worden de 20 antwoorden zonder tussenkomst opgeslagen en zijn ze op zijn andere apparaten zichtbaar

### Requirement: Offline-status zichtbaar
Het systeem SHALL zichtbaar maken wanneer het offline werkt en hoeveel antwoorden nog niet zijn verstuurd.

#### Scenario: Nog niet gesynchroniseerd
- **WHEN** de leerling offline is en 12 antwoorden nog niet zijn verstuurd
- **THEN** toont het systeem een melding als "Offline - 12 antwoorden worden later bewaard"

### Requirement: Nieuwe versie bijwerken
Het systeem SHALL een nieuwe versie van de app automatisch ophalen wanneer er verbinding is en die bij de volgende start gebruiken, zonder dat bewaarde voortgang of de onthouden naam verloren gaan.

#### Scenario: Correctie in de lesstof
- **WHEN** er een verbeterde versie van het inhoudspakket is gepubliceerd en de leerling de app online opent
- **THEN** gebruikt de app uiterlijk bij de volgende start de nieuwe versie en blijft de voortgang behouden
