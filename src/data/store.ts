// Storage layer on Firestore (design D5). Answers and test results are
// append-only; levels are computed client-side from the answer log.

import {
  addDoc, collection, doc, getDoc, onSnapshot, setDoc,
} from 'firebase/firestore';
import type { AnswerRecord } from '../engine/mastery';
import { db } from './firebase';

export interface TestResult {
  at: number;
  score: number;
  total: number;
  grade: number;
  durationMs: number;
}

/** Cached overview numbers on the learner document, for the overview page. */
export interface LearnerSummary {
  b1: { mastered: number; automated: number };
  b2: { mastered: number; automated: number };
  b3: { mastered: number; automated: number };
  total: { mastered: number; automated: number };
  lastTestGrade?: number;
  lastTestAt?: number;
}

export interface LearnerDoc {
  key: string;
  displayName: string;
  createdAt?: number;
  lastActive: number;
  summary?: LearnerSummary;
}

const learnerRef = (key: string) => doc(db, 'learners', key);
const answersRef = (key: string) => collection(db, 'learners', key, 'answers');
const testsRef = (key: string) => collection(db, 'learners', key, 'tests');

/** Creates or touches the learner document. Works offline (queued). */
export function touchLearner(key: string, displayName: string): void {
  const now = Date.now();
  void setDoc(learnerRef(key), { displayName, lastActive: now }, { merge: true }).catch(logError);
  // createdAt only for new learners; skipped silently when offline.
  getDoc(learnerRef(key))
    .then((snap) => {
      if (!snap.data()?.createdAt) return setDoc(learnerRef(key), { displayName, lastActive: now, createdAt: now }, { merge: true });
    })
    .catch(() => undefined);
}

/**
 * Stores one answer. Not awaited on purpose: offline the promise only
 * resolves once the server has it, while the local cache updates at once.
 */
export function addAnswer(key: string, a: AnswerRecord): void {
  void addDoc(answersRef(key), a).catch(logError);
}

export function addTestResult(key: string, r: TestResult): void {
  void addDoc(testsRef(key), r).catch(logError);
}

export function updateSummary(key: string, displayName: string, summary: LearnerSummary): void {
  void setDoc(learnerRef(key), { displayName, lastActive: Date.now(), summary }, { merge: true }).catch(logError);
}

export interface AnswerSnapshot {
  answers: AnswerRecord[];
  /** Answers stored locally but not yet confirmed by the server. */
  pending: number;
  /** True when the data comes from the local cache only. */
  fromCache: boolean;
}

/** Live answer log of one learner, including writes from other devices. */
export function subscribeAnswers(key: string, cb: (s: AnswerSnapshot) => void): () => void {
  return onSnapshot(
    answersRef(key),
    { includeMetadataChanges: true },
    (snap) => {
      cb({
        answers: snap.docs.map((d) => d.data() as AnswerRecord),
        pending: snap.docs.filter((d) => d.metadata.hasPendingWrites).length,
        fromCache: snap.metadata.fromCache,
      });
    },
    logError,
  );
}

export function subscribeTests(key: string, cb: (tests: TestResult[]) => void): () => void {
  return onSnapshot(
    testsRef(key),
    (snap) => cb(snap.docs.map((d) => d.data() as TestResult).sort((a, b) => a.at - b.at)),
    logError,
  );
}

export function subscribeLearners(cb: (learners: LearnerDoc[]) => void): () => void {
  return onSnapshot(
    collection(db, 'learners'),
    (snap) => cb(snap.docs.map((d) => ({ key: d.id, ...(d.data() as Omit<LearnerDoc, 'key'>) }))),
    logError,
  );
}

function logError(e: unknown): void {
  console.error('[store]', e);
}
