# answer-checking Specification

## Purpose

Antwoorden nakijken zoals een docent dat op het proefwerk zou doen (streng op accenten en elisie, soepel op opmaak) en direct uitleggen wat er fout ging.

## Requirements

### Requirement: Opmaak telt niet mee
Het systeem SHALL bij het nakijken hoofdletters, spaties aan begin en eind, dubbele spaties en het type apostrof (' of ’) negeren.

#### Scenario: Hoofdletter en krul-apostrof
- **WHEN** de leerling op een telefoon "J’aime " invult en het juiste antwoord "j'aime" is
- **THEN** rekent het systeem het antwoord goed

### Requirement: Accenten tellen mee
Het systeem SHALL een Frans antwoord met een ontbrekend of verkeerd accent of ontbrekende cedille fout rekenen.

#### Scenario: Ontbrekend accent in voltooid deelwoord
- **WHEN** de leerling "avons achete" invult en het juiste antwoord "avons acheté" is
- **THEN** rekent het systeem het antwoord fout en wijst het op het ontbrekende accent

#### Scenario: Ontbrekende cedille
- **WHEN** de leerling "commencons" invult en het juiste antwoord "commençons" is
- **THEN** rekent het systeem het antwoord fout

### Requirement: Elisie telt mee
Het systeem SHALL bij de persoon je het voornaamwoord meenakijken en "je" vóór een klinker of stomme h fout rekenen, evenals "j'" vóór een medeklinker.

#### Scenario: Je in plaats van j'
- **WHEN** de leerling "je aime" invult en het juiste antwoord "j'aime" is
- **THEN** rekent het systeem het antwoord fout en legt het de regel van de elisie uit

### Requirement: Voornaamwoord optioneel bij andere personen
Het systeem SHALL bij de personen tu, il/elle/on, nous, vous en ils/elles zowel alleen de werkwoordsvorm als de vorm met het juiste voornaamwoord ervoor goed rekenen.

#### Scenario: Met of zonder nous
- **WHEN** de vraag "Nous (geven)" is en de leerling "donnons" of "nous donnons" invult
- **THEN** rekent het systeem beide antwoorden goed

### Requirement: Lidwoord bij Franse woorden
Het systeem SHALL bij vertalen naar het Frans het lidwoord verplicht stellen als het woord in het boek met lidwoord staat, en bij woorden als "l'ami(e)" zowel de mannelijke als de vrouwelijke vorm goed rekenen.

#### Scenario: Lidwoord vergeten
- **WHEN** de vraag "de zee" is en de leerling "mer" invult
- **THEN** rekent het systeem het antwoord fout met de melding dat het lidwoord ontbreekt

#### Scenario: Mannelijk of vrouwelijk
- **WHEN** de vraag "de vriend(in)" is en de leerling "l'amie" invult
- **THEN** rekent het systeem het antwoord goed

### Requirement: Soepel bij Nederlandse antwoorden
Het systeem SHALL bij vertalen naar het Nederlands elk van de opgegeven betekenissen goed rekenen, met of zonder Nederlands lidwoord en met of zonder delen tussen haakjes.

#### Scenario: Een van meerdere betekenissen
- **WHEN** de vraag "parler" is en de leerling "spreken" invult
- **THEN** rekent het systeem het antwoord goed

#### Scenario: Zonder lidwoord en haakjes
- **WHEN** de vraag "proposer" is en de leerling "voorstellen" invult
- **THEN** rekent het systeem het antwoord goed

### Requirement: Uitleg bij een fout antwoord
Het systeem SHALL bij een fout antwoord direct het juiste antwoord tonen, het verschil met het gegeven antwoord markeren en, waar van toepassing, de bijbehorende regel kort uitleggen.

#### Scenario: Verkeerde uitgang
- **WHEN** de leerling bij "Vous (zoeken)" "cherchons" invult
- **THEN** toont het systeem "cherchez", markeert het de uitgang en noemt het de regel "vous → stam + ez"

### Requirement: Diagnose van gecombineerde vragen
Het systeem SHALL bij een vraag die meerdere deelvaardigheden toetst (zoals betekenis en vervoeging in "Les filles (geven)") vaststellen welke deelvaardigheid fout ging, en de uitkomst per deelvaardigheid doorgeven aan de voortgangsmeting.

#### Scenario: Goed werkwoord, verkeerde uitgang
- **WHEN** de vraag "Nous (kopen)" is en de leerling "achetez" invult
- **THEN** telt het systeem de betekenis van acheter als goed en de uitgang bij nous als fout

#### Scenario: Verkeerd werkwoord
- **WHEN** de vraag "Nous (kopen)" is en de leerling "trouvons" invult
- **THEN** telt het systeem de betekenis van acheter als fout
