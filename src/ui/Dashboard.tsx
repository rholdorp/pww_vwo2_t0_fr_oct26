import { BLOCK_TITLE } from '../content/items';
import { pack } from '../content/pww-oct26';
import type { Block } from '../content/types';
import { dayKey } from '../engine/mastery';
import { dayPlan, nextLesson } from '../engine/session';
import { weakPoints } from '../engine/weak';
import type { Learner } from './useLearner';
import { ITEMS } from './useLearner';

function Bar({ mastered, automated }: { mastered: number; automated: number }) {
  return (
    <div class="bar" role="img" aria-label={`${mastered}% beheerst, ${automated}% geautomatiseerd`}>
      <span class="mastered" style={{ width: `${mastered}%` }} />
      <span class="auto" style={{ width: `${automated}%` }} />
    </div>
  );
}

function StatRow({ title, mastered, automated }: { title: string; mastered: number; automated: number }) {
  return (
    <div class="stack" style={{ gap: '4px' }}>
      <div class="row spread">
        <strong>{title}</strong>
        <span class="muted">{mastered}% beheerst · {automated}% snel</span>
      </div>
      <Bar mastered={mastered} automated={automated} />
    </div>
  );
}

const fmtDate = (at: number) =>
  new Date(at).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });

interface Props {
  learner: Learner;
  onPractice: (forceLesson: boolean) => void;
  onTest: () => void;
  onSwitch: () => void;
  onOverview: () => void;
}

export function Dashboard({ learner, onPractice, onTest, onSwitch, onOverview }: Props) {
  const { stats, states } = learner;
  const now = Date.now();
  const plan = dayPlan(pack, states, now);
  const today = dayKey(now);
  const sessionsToday = new Set(learner.answers.filter((a) => dayKey(a.at) === today).map((a) => a.sessionId)).size;
  const lessonsLeft = plan.lessonsToday.length - plan.doneToday.length;
  const goalReached = lessonsLeft <= 0 && sessionsToday >= plan.sessionsGoal;
  const upcoming = nextLesson(pack, states);
  const weak = weakPoints(ITEMS, states);

  return (
    <main class="page">
      <div class="row spread">
        <h1>Hoi {learner.displayName}!</h1>
      </div>
      <p class="muted">
        {plan.testDay ? 'Vandaag is de toets. Bonne chance !'
          : `Nog ${plan.daysLeft} ${plan.daysLeft === 1 ? 'dag' : 'dagen'} tot de toets (${fmtDate(new Date(pack.testDate + 'T08:00').getTime())}).`}
      </p>

      <section class="card stack">
        <h2>Vandaag</h2>
        {goalReached ? (
          <p class="feedback good">Dagdoel gehaald! Extra oefenen mag altijd.</p>
        ) : (
          <ul class="plain">
            {plan.lessonsToday.map((l) => (
              <li key={l.id}>{plan.doneToday.includes(l) ? '✓ ' : '○ '}{l.title}</li>
            ))}
            {plan.reviewDay && <li>○ Herhalen en een proeftoets maken</li>}
            <li>{sessionsToday >= plan.sessionsGoal ? '✓' : '○'} {plan.sessionsGoal} sessies van 15 minuten ({sessionsToday} gedaan)</li>
          </ul>
        )}
        <button class="primary full" onClick={() => onPractice(false)}>Oefenen (15 min)</button>
        <div class="row">
          {upcoming && <button onClick={() => onPractice(true)}>Volgende les: {upcoming.id.slice(1)}</button>}
          <button onClick={onTest}>Proeftoets</button>
        </div>
      </section>

      <section class="card stack">
        <h2>Voortgang</h2>
        {([1, 2, 3] as Block[]).map((b) => (
          <StatRow key={b} title={`${b}. ${BLOCK_TITLE[b]}`} {...stats.blocks[b]} />
        ))}
        <StatRow title="Totaal" {...stats.total} />
        <p class="muted">Lichte balk: beheerst (goed getypt). Donkere balk: geautomatiseerd (goed én snel).</p>
      </section>

      {weak.length > 0 && (
        <section class="card stack">
          <h2>Let op</h2>
          <ul class="plain">{weak.map((i) => <li key={i.id}>{i.label}</li>)}</ul>
        </section>
      )}

      {learner.tests.length > 0 && (
        <section class="card stack">
          <h2>Proeftoetsen</h2>
          <ul class="plain">
            {[...learner.tests].reverse().map((t) => (
              <li key={t.at} class="row spread">
                <span>{fmtDate(t.at)}</span>
                <span>{t.score}/{t.total} · <strong>{t.grade.toFixed(1).replace('.', ',')}</strong></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div class="row spread">
        <button class="link" onClick={onSwitch}>Niet jij? Wissel van naam</button>
        <button class="link" onClick={onOverview}>Overzicht</button>
      </div>
    </main>
  );
}
