import { useEffect, useState } from 'preact/hooks';
import { ensureSignedIn } from '../data/firebase';
import { loadName, nameKey, saveName } from '../data/identity';
import { touchLearner } from '../data/store';
import { LearnerApp } from './LearnerApp';
import { NameScreen } from './NameScreen';
import { Overview } from './Overview';

export function App() {
  const [name, setName] = useState(loadName());
  const [ready, setReady] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    ensureSignedIn()
      .catch((e) => console.error('[auth]', e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && name) touchLearner(nameKey(name), name);
  }, [ready, name]);

  const choose = (n: string | undefined) => {
    saveName(n);
    setName(n);
  };

  if (!ready) return <main class="page"><p class="muted">Laden...</p></main>;
  if (showOverview) return <Overview onBack={() => setShowOverview(false)} />;
  if (!name) return <NameScreen onName={choose} onOverview={() => setShowOverview(true)} />;
  return (
    <LearnerApp
      key={nameKey(name)}
      learnerKey={nameKey(name)}
      displayName={name}
      onSwitch={() => choose(undefined)}
      onOverview={() => setShowOverview(true)}
    />
  );
}
