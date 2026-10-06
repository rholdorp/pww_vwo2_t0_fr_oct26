# Frans Toetstrainer · proefwerk oktober 2026

Trainer voor het proefwerk Frans (VWO 2, maandag 12 oktober 2026): présent en passé composé van de -er werkwoorden en être/avoir/faire/aller, plus vocabulaire chapitre 1 (A, B, E, F). Lesstof uit het draaiboek *V2 Draaiboek oktober 2025 Grammatica*.

**App:** https://frans-trainer-vwo2-t0-oct26.web.app

## Gebruik

1. Open de link en vul een zelfverzonnen naam in. Gebruik op telefoon en laptop **dezelfde naam**, dan zie je overal dezelfde voortgang.
2. Druk op **Oefenen (15 min)**. De app geeft eerst uitleg bij nieuwe stof en overhoort daarna. Twee à drie sessies per dag is het plan.
3. Maak tegen het eind een **Proeftoets** (40 vragen, cijfer 1-10).
4. Ouders kunnen meekijken via **Overzicht** op het naamscherm of het dashboard.

Werkt ook zonder internet: antwoorden worden bewaard en later vanzelf verstuurd.

### Op het beginscherm zetten

- **iPhone/iPad (Safari):** open de link, tik op het deel-icoon (vierkant met pijl) → *Zet op beginscherm* → *Voeg toe*.
- **Android (Chrome):** open de link, tik op ⋮ → *App installeren* of *Toevoegen aan startscherm*.
- **Laptop (Chrome/Edge):** klik in de adresbalk op het installeer-icoon, of gebruik gewoon de link.

### Niveaus

| Niveau | Betekenis |
| --- | --- |
| 0 | nieuw |
| 1 | herkent (goed bij meerkeuze) |
| 2 | typt goed → telt als **beheerst** |
| 3 | typt goed en snel (≤ 5 s, of ≤ 8 s voor passé composé en toetszinnen) → telt als **geautomatiseerd** |
| 4 | blijft hangen (ook op een latere dag snel en goed) |

Accenten en *j'* tellen mee, net als op de toets.

## Ontwikkelen

```bash
npm install
npm run emulators   # Firebase Auth + Firestore emulator (Java nodig)
npm run dev         # app op http://localhost:5173, praat met de emulator
npm test            # unit tests (lesstof, nakijken, niveaus, planning, proeftoets)
npm run test:rules  # Firestore-regels tegen de emulator
```

- Lesstof: `src/content/pww-oct26.ts` (één bestand per toets).
- Nakijken en voortgang: `src/engine/`.
- Firebase: `src/data/`, regels in `firestore.rules`.

### Publiceren

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

Terugdraaien kan via de Firebase-console → Hosting → vorige versie terugzetten; de voortgang in Firestore blijft daarbij gewoon staan.
