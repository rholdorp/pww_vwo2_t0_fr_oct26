interface Props {
  learnerKey: string;
  displayName: string;
  onSwitch: () => void;
  onOverview: () => void;
}

export function LearnerApp({ displayName, onSwitch }: Props) {
  return (
    <main class="page">
      <h1>Hoi {displayName}!</h1>
      <button class="link" onClick={onSwitch}>Niet jij? Wissel van naam</button>
    </main>
  );
}
