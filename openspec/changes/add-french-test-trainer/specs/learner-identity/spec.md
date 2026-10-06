# Spec Delta

## Purpose

Leerlingen onderscheiden met alleen een zelfverzonnen naam, zodat iedereen snel kan beginnen en zijn eigen voortgang op elk apparaat terugvindt.

## ADDED Requirements

### Requirement: Inloggen met een naam
Het systeem SHALL een leerling laten beginnen door alleen een zelfverzonnen naam in te vullen, zonder wachtwoord, pincode, e-mailadres of ander account. Een naam bestaat uit 2 tot 20 tekens: letters, cijfers, spaties of koppeltekens.

#### Scenario: Nieuwe naam
- **WHEN** een leerling op een apparaat zonder bewaarde naam "Stijn" invult en bevestigt
- **THEN** opent het systeem het dashboard van "Stijn" met lege voortgang

#### Scenario: Ongeldige naam
- **WHEN** een leerling "S" of een naam met tekens als "@" of "/" invult
- **THEN** weigert het systeem de naam met een uitleg welke namen zijn toegestaan

### Requirement: Naam als sleutel over apparaten heen
Het systeem SHALL namen normaliseren (spaties aan begin en eind weg, meerdere spaties samenvoegen, geen onderscheid tussen hoofd- en kleine letters) en dezelfde genormaliseerde naam op elk apparaat aan dezelfde voortgang koppelen.

#### Scenario: Zelfde naam op tweede apparaat
- **WHEN** Stijn op zijn telefoon als "Stijn" heeft geoefend en op de laptop "stijn " invult
- **THEN** toont de laptop de voortgang die op de telefoon is opgebouwd

### Requirement: Naam onthouden per apparaat
Het systeem SHALL de laatst gebruikte naam op het apparaat onthouden en bij het openen direct het dashboard van die naam tonen.

#### Scenario: App opnieuw openen
- **WHEN** een leerling de app opnieuw opent op een apparaat waar hij eerder "Stijn" heeft ingevuld
- **THEN** opent het systeem direct het dashboard van "Stijn" zonder naar de naam te vragen

### Requirement: Van naam wisselen
Het systeem SHALL vanaf het dashboard een mogelijkheid bieden om van naam te wisselen; de voortgang van de vorige naam blijft daarbij bewaard.

#### Scenario: Ander kind op hetzelfde apparaat
- **WHEN** een leerling op het dashboard van "Stijn" kiest voor "Niet jij? Wissel van naam" en "Lars" invult
- **THEN** toont het systeem het dashboard van "Lars" en blijft de voortgang van "Stijn" ongewijzigd
