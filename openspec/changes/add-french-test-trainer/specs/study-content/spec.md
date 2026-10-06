# Spec Delta

## Purpose

De toetsstof van één proefwerk vastleggen als inhoudspakket: werkwoorden, vervoegingen, woordenlijsten, uitleg en lesvolgorde, zodat de app precies de stof uit het draaiboek aanbiedt.

## ADDED Requirements

### Requirement: Eén inhoudspakket per toets
Het systeem SHALL alle toetsstof (blokken, items, juiste antwoorden, uitleg, lessenvolgorde en toetsdatum) uit één inhoudspakket halen, los van de app-logica, zodat een volgende toets alleen een nieuw pakket vraagt.

#### Scenario: Toetsdatum uit het pakket
- **WHEN** het inhoudspakket voor deze toets toetsdatum 2026-10-12 bevat
- **THEN** rekent het systeem het dagplan en de "nog X dagen"-melding uit op basis van die datum

### Requirement: Blok 1 - présent
Het inhoudspakket SHALL de présent bevatten van de 25 regelmatige -er werkwoorden uit het draaiboek (visiter t/m oublier, met hun Nederlandse betekenis) en van être, avoir, faire en aller, voor de personen je, tu, il/elle/on, nous, vous en ils/elles.

#### Scenario: Regelmatig werkwoord
- **WHEN** het systeem de présent van "donner" voor nous opvraagt
- **THEN** is het juiste antwoord "donnons"

#### Scenario: Onregelmatig werkwoord
- **WHEN** het systeem de présent van "aller" voor ils/elles opvraagt
- **THEN** is het juiste antwoord "vont"

### Requirement: Correct Frans bij spellingsvarianten
Het inhoudspakket SHALL de correcte Franse vormen gebruiken waar de regel "stam + uitgang" afwijkt: nous mangeons, nous changeons, nous commençons, de accent grave bij acheter (j'achète) en préférer (je préfère) en zowel -ie- als -ye- vormen bij payer en essayer.

#### Scenario: Manger met nous
- **WHEN** het systeem de présent van "manger" voor nous opvraagt
- **THEN** is het juiste antwoord "mangeons" en wordt "mangons" fout gerekend

#### Scenario: Payer met twee spellingen
- **WHEN** het systeem de présent van "payer" voor je opvraagt
- **THEN** worden zowel "je paie" als "je paye" goed gerekend

### Requirement: Elisie bij je
Het inhoudspakket SHALL bij de persoon je aangeven of het voornaamwoord tot j' wordt ingekort (vóór een klinker of stomme h), zodat bijvoorbeeld "j'aime", "j'habite" en "j'ai" de juiste vormen zijn.

#### Scenario: Werkwoord met klinker
- **WHEN** het systeem de présent van "aimer" voor je opvraagt
- **THEN** is het juiste antwoord "j'aime"

### Requirement: Blok 2 - passé composé
Het inhoudspakket SHALL de passé composé bevatten als avoir in de présent plus het voltooid deelwoord, voor de -er werkwoorden (stam + é) en voor être (été), avoir (eu) en faire (fait). De werkwoorden arriver en rentrer SHALL NOT in de passé composé gevraagd worden.

#### Scenario: Regelmatig werkwoord in de passé composé
- **WHEN** het systeem de passé composé van "acheter" voor nous opvraagt
- **THEN** is het juiste antwoord "avons acheté"

#### Scenario: Être in de passé composé
- **WHEN** het systeem de passé composé van "être" voor je opvraagt
- **THEN** is het juiste antwoord "j'ai été"

#### Scenario: Arriver uitgesloten
- **WHEN** het systeem vragen voor de passé composé samenstelt
- **THEN** komen arriver en rentrer daarin niet voor

### Requirement: Blok 3 - vocabulaire
Het inhoudspakket SHALL de 80 woorden van chapitre 1, delen A, B, E en F bevatten, met de Franse vorm inclusief lidwoord waar het boek dat geeft, en de Nederlandse betekenis of betekenissen.

#### Scenario: Woord met meerdere betekenissen
- **WHEN** het pakket het woord "le temps" bevat
- **THEN** zijn "het weer" en "de tijd" beide geldige Nederlandse betekenissen

### Requirement: Uitleg per onderdeel
Het inhoudspakket SHALL bij elk grammaticaonderdeel een korte uitleg in het Nederlands bevatten (de regel, een voorbeeldrijtje, aandachtspunten), in lijn met het draaiboek.

#### Scenario: Uitleg -er werkwoorden
- **WHEN** de leerling de uitleg over de présent van -er werkwoorden opent
- **THEN** ziet hij de regel "stam + e / es / e / ons / ez / ent" met het voorbeeld donner
