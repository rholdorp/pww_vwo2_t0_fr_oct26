# mastery-tracking Specification

## Purpose

Per leerling bijhouden hoe goed en hoe snel hij elk onderdeel van de stof beheerst, gedeeld tussen al zijn apparaten, zodat oefenen gericht kan en de voortgang meetbaar is.

## Requirements

### Requirement: Items en deelvaardigheden
Het systeem SHALL beheersing meten per item: elk vocabulairewoord per richting, de betekenis van elk -er werkwoord per richting, de uitgang van de regelmatige présent per persoon, elke spellingsvariant, elke vorm van être/avoir/faire/aller in de présent, de regel van het voltooid deelwoord (é), de deelwoorden été/eu/fait en het hulpwerkwoord per persoon.

#### Scenario: Regel in plaats van losse vormen
- **WHEN** de leerling "nous parlons" en later "nous jouons" goed invult
- **THEN** telt het systeem beide antwoorden mee voor hetzelfde item "uitgang présent bij nous" en voor de betekenis van het betreffende werkwoord

### Requirement: Beheersingsniveaus
Het systeem SHALL per item een niveau bijhouden: 0 nieuw, 1 herkent (goed bij meerkeuze), 2 typt goed, 3 typt goed en snel, 4 blijft hangen (snel en goed op een latere kalenderdag dan het eerste keer snel en goed).

#### Scenario: Van herkennen naar typen
- **WHEN** een item op niveau 1 staat en de leerling het correct typt, maar trager dan de snelheidsgrens
- **THEN** komt het item op niveau 2

#### Scenario: Blijft hangen
- **WHEN** een item op niveau 3 staat sinds dinsdag en de leerling het op woensdag snel en goed typt
- **THEN** komt het item op niveau 4

### Requirement: Snelheidsgrens
Het systeem SHALL een getypt antwoord als "snel" tellen als het binnen de snelheidsgrens van het vraagtype is gegeven: 5 seconden voor één woord of vorm, 8 seconden voor een passé composé of een gecombineerde toetszin, gemeten vanaf het tonen van de vraag.

#### Scenario: Te langzaam
- **WHEN** de leerling "Tu (zijn)" na 7 seconden goed beantwoordt met "es"
- **THEN** telt het antwoord als goed maar niet als snel

### Requirement: Terugval bij een fout
Het systeem SHALL een item bij een fout antwoord één niveau laten zakken, maar niet onder niveau 1 als het item al eens is aangeboden.

#### Scenario: Fout op niveau 3
- **WHEN** een item op niveau 3 staat en de leerling het fout beantwoordt
- **THEN** staat het item daarna op niveau 2

### Requirement: Elk antwoord wordt vastgelegd
Het systeem SHALL elk gegeven antwoord direct vastleggen met de leerling, de betrokken items en de uitkomst per item, de antwoordtijd en het tijdstip, en de niveaus afleiden uit deze vastgelegde antwoorden.

#### Scenario: Sessie halverwege afgebroken
- **WHEN** de leerling na 7 vragen de app sluit
- **THEN** zijn de uitkomsten van die 7 vragen bewaard en meegeteld in de voortgang

### Requirement: Gedeeld tussen apparaten
Het systeem SHALL antwoorden van alle apparaten van dezelfde leerling samenvoegen zonder dat antwoorden verloren gaan, ook als er op twee apparaten tegelijk offline is geoefend.

#### Scenario: Twee apparaten offline
- **WHEN** de leerling offline 20 vragen op de telefoon en 15 vragen op de laptop beantwoordt en beide apparaten daarna weer online komen
- **THEN** telt de voortgang op beide apparaten alle 35 antwoorden mee

### Requirement: Percentages per blok
Het systeem SHALL per blok (1 présent, 2 passé composé, 3 vocabulaire) en voor de stof als geheel twee percentages berekenen: "% beheerst" (aandeel items op niveau 2 of hoger) en "% geautomatiseerd" (aandeel items op niveau 3 of hoger). Het totaal is het gemiddelde van de drie blokken.

#### Scenario: Half beheerst
- **WHEN** in blok 3 80 van de 160 vocabulaire-items op niveau 2 of hoger staan, waarvan 40 op niveau 3 of hoger
- **THEN** toont het systeem voor blok 3 "50% beheerst" en "25% geautomatiseerd"
