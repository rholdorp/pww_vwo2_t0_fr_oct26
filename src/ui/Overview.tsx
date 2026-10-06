import { useEffect, useState } from 'preact/hooks';
import type { LearnerDoc } from '../data/store';
import { subscribeLearners } from '../data/store';

interface Props {
  onBack: () => void;
}

const fmt = (at: number) =>
  new Date(at).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Pct({ v }: { v?: { mastered: number; automated: number } }) {
  return <span>{v ? `${v.mastered}% · ${v.automated}%` : '-'}</span>;
}

export function Overview({ onBack }: Props) {
  const [learners, setLearners] = useState<LearnerDoc[]>();

  useEffect(() => subscribeLearners((l) => setLearners([...l].sort((a, b) => b.lastActive - a.lastActive))), []);

  return (
    <main class="page">
      <button class="link" onClick={onBack}>← Terug</button>
      <h1>Overzicht</h1>
      <p class="muted">Per blok: % beheerst · % geautomatiseerd.</p>
      {!learners && <p class="muted">Laden...</p>}
      {learners?.length === 0 && <p class="muted">Nog niemand heeft geoefend.</p>}
      {learners?.map((l) => (
        <section key={l.key} class="card stack">
          <div class="row spread">
            <h2 style={{ margin: 0 }}>{l.displayName}</h2>
            {l.summary?.lastTestGrade !== undefined && (
              <span>proeftoets <strong>{l.summary.lastTestGrade.toFixed(1).replace('.', ',')}</strong></span>
            )}
          </div>
          <table class="conj">
            <tbody>
              <tr><td>1. Présent</td><td><Pct v={l.summary?.b1} /></td></tr>
              <tr><td>2. Passé composé</td><td><Pct v={l.summary?.b2} /></td></tr>
              <tr><td>3. Vocabulaire</td><td><Pct v={l.summary?.b3} /></td></tr>
              <tr><td><strong>Totaal</strong></td><td><strong><Pct v={l.summary?.total} /></strong></td></tr>
            </tbody>
          </table>
          <p class="muted">Laatst actief: {fmt(l.lastActive)}</p>
        </section>
      ))}
    </main>
  );
}
