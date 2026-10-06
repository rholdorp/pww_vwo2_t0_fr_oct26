import { useState } from 'preact/hooks';
import { Dashboard } from './Dashboard';
import { Session } from './Session';
import { useLearner } from './useLearner';

interface Props {
  learnerKey: string;
  displayName: string;
  onSwitch: () => void;
  onOverview: () => void;
}

type Route = { name: 'dashboard' } | { name: 'session'; forceLesson: boolean } | { name: 'test' };

export function LearnerApp({ learnerKey, displayName, onSwitch, onOverview }: Props) {
  const learner = useLearner(learnerKey, displayName);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const home = () => setRoute({ name: 'dashboard' });

  if (!learner.loaded) return <main class="page"><p class="muted">Voortgang laden...</p></main>;

  switch (route.name) {
    case 'session':
      return <Session learner={learner} forceLesson={route.forceLesson} onDone={home} />;
    case 'test':
      return <main class="page"><p>Proeftoets volgt.</p><button onClick={home}>Terug</button></main>;
    default:
      return (
        <Dashboard
          learner={learner}
          onPractice={(forceLesson) => setRoute({ name: 'session', forceLesson })}
          onTest={() => setRoute({ name: 'test' })}
          onSwitch={onSwitch}
          onOverview={onOverview}
        />
      );
  }
}
