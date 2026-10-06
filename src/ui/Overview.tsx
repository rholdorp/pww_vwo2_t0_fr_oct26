interface Props {
  onBack: () => void;
}

// Filled in by task 8.2.
export function Overview({ onBack }: Props) {
  return (
    <main class="page">
      <button class="link" onClick={onBack}>← Terug</button>
      <h1>Overzicht</h1>
    </main>
  );
}
