import { useState } from 'preact/hooks';
import { cleanName, validateName } from '../data/identity';

interface Props {
  onName: (name: string) => void;
  onOverview: () => void;
}

export function NameScreen({ onName, onOverview }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  const submit = (e: Event) => {
    e.preventDefault();
    const err = validateName(value);
    setError(err);
    if (!err) onName(cleanName(value));
  };

  return (
    <main class="page">
      <h1>Frans Toetstrainer</h1>
      <form class="card stack" onSubmit={submit}>
        <h2>Hoe heet je?</h2>
        <p class="muted">Verzin een naam. Gebruik op je telefoon en laptop dezelfde naam, dan zie je overal je eigen voortgang.</p>
        <input
          type="text"
          value={value}
          onInput={(e) => setValue((e.target as HTMLInputElement).value)}
          autocomplete="nickname"
          autocapitalize="words"
          enterkeyhint="go"
          maxLength={20}
          aria-label="Je naam"
          autoFocus
        />
        {error && <p class="feedback bad">{error}</p>}
        <button class="primary full" type="submit">Start</button>
      </form>
      <button class="link" onClick={onOverview}>Overzicht van alle leerlingen</button>
    </main>
  );
}
