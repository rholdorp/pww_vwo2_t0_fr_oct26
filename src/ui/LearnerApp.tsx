import { useEffect, useState } from 'preact/hooks';
import { updateSummary } from '../data/store';
import { Dashboard } from './Dashboard';
import { OfflineBanner } from './OfflineBanner';
import { PracticeTest } from './PracticeTest';
import { Session } from './Session';
import { useLearner } from './useLearner';
import type { VocabChoice } from '../engine/vocabRound';
import { VocabTrainer } from './VocabTrainer';

interface Props {
  learnerKey: string;
  displayName: string;
  onSwitch: () => void;
  onOverview: () => void;
}

type Route =
  | { name: 'dashboard' }
  | { name: 'session'; forceLesson: boolean }
  | { name: 'test' }
  | { name: 'vocab'; choice: VocabChoice };

export function LearnerApp({ learnerKey, displayName, onSwitch, onOverview }: Props) {
  const learner = useLearner(learnerKey, displayName);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const home = () => setRoute({ name: 'dashboard' });

  // Refresh the overview numbers whenever the learner is back on the dashboard
  // (after a session or practice test).
  const { stats, tests, answers, loaded } = learner;
  useEffect(() => {
    if (!loaded || route.name !== 'dashboard' || answers.length === 0) return;
    const last = tests[tests.length - 1];
    const s = stats.blocks;
    updateSummary(learnerKey, displayName, {
      b1: { mastered: s[1].mastered, automated: s[1].automated },
      b2: { mastered: s[2].mastered, automated: s[2].automated },
      b3: { mastered: s[3].mastered, automated: s[3].automated },
      total: stats.total,
      ...(last ? { lastTestGrade: last.grade, lastTestAt: last.at } : {}),
    });
  }, [loaded, route.name, answers.length, tests.length]);

  if (!learner.loaded) return <main class="page"><p class="muted">Voortgang laden...</p></main>;

  let content;
  switch (route.name) {
    case 'session':
      content = <Session learner={learner} forceLesson={route.forceLesson} onDone={home} />;
      break;
    case 'test':
      content = <PracticeTest learner={learner} onDone={home} />;
      break;
    case 'vocab':
      content = <VocabTrainer key={route.choice} learner={learner} choice={route.choice} onDone={home} />;
      break;
    default:
      content = (
        <Dashboard
          learner={learner}
          onPractice={(forceLesson) => setRoute({ name: 'session', forceLesson })}
          onTest={() => setRoute({ name: 'test' })}
          onVocab={(choice) => setRoute({ name: 'vocab', choice })}
          onSwitch={onSwitch}
          onOverview={onOverview}
        />
      );
  }
  return (
    <>
      <OfflineBanner pending={learner.pending} />
      {content}
    </>
  );
}
