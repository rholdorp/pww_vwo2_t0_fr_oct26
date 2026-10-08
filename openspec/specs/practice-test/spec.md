# practice-test Specification

## Purpose

De leerling laten oefenen onder toetsomstandigheden, in hetzelfde formaat als het proefwerk, met een cijfer als graadmeter voor zijn toetsgereedheid.

## Requirements

### Requirement: Proeftoets in toetsformaat
Het systeem SHALL een proeftoets van 40 vragen samenstellen uit alle drie de blokken: 10 toetszinnen met regelmatige -er werkwoorden in de présent, 10 met être/avoir/faire/aller in de présent, 10 in de passé composé en 10 vocabulairevragen (beide richtingen). De onderwerpen zijn zoals in het draaiboek, bijvoorbeeld "Les filles", "Le prof", "Monsieur, vous" en "On".

#### Scenario: Toetszin passé composé
- **WHEN** de proeftoets een passé-composé-vraag bevat
- **THEN** ziet die eruit als "Nous (kopen) ___" en verwacht het systeem hulpwerkwoord plus voltooid deelwoord, zoals "avons acheté"

#### Scenario: Onderwerp als zelfstandig naamwoord
- **WHEN** de vraag "Le prof (werken)" is
- **THEN** verwacht het systeem de vorm voor il/elle: "travaille"

### Requirement: Geen hulp tijdens de proeftoets
Het systeem SHALL tijdens de proeftoets geen meerkeuze, uitleg of juiste antwoorden tonen; de leerling ziet de uitslag pas aan het eind. De accentknoppen blijven beschikbaar.

#### Scenario: Fout antwoord tijdens de toets
- **WHEN** de leerling een vraag in de proeftoets fout beantwoordt
- **THEN** gaat het systeem zonder melding door naar de volgende vraag

### Requirement: Tijd en cijfer
Het systeem SHALL tijdens de proeftoets de verstreken tijd tonen en aan het eind een cijfer op de schaal 1 tot 10 geven (1 + 9 × aantal goed / aantal vragen, op één decimaal), samen met de totale tijd.

#### Scenario: 32 van 40 goed
- **WHEN** de leerling 32 van de 40 vragen goed heeft
- **THEN** toont het systeem het cijfer 8,2

### Requirement: Nabespreking en terugkoppeling
Het systeem SHALL na de proeftoets alle fout beantwoorde vragen tonen met het juiste antwoord en de uitleg, en de uitkomsten meetellen in de voortgang zodat fout beantwoorde items in volgende sessies voorrang krijgen.

#### Scenario: Fouten komen terug
- **WHEN** de leerling in de proeftoets "Vous (betalen)" fout heeft beantwoord
- **THEN** ziet hij in de nabespreking "avez payé" en komt het betrokken item in de volgende oefensessie terug

### Requirement: Uitslagen bewaren
Het systeem SHALL de uitslag van elke proeftoets (datum, cijfer, tijd) bewaren bij de leerling en tonen op het dashboard.

#### Scenario: Meerdere proeftoetsen
- **WHEN** de leerling op zaterdag een 6,4 en op zondag een 8,2 heeft gehaald
- **THEN** toont het dashboard beide uitslagen met datum
