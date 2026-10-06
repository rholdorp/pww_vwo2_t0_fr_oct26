// Run with: npm run test:rules (starts the Firestore emulator).
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-trainer',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const answer = { items: { 'end:pres:nous': true }, ms: 2100, fast: true, at: 1791280000000, mode: 'type', sessionId: 's1' };
const learner = { displayName: 'Stijn', lastActive: 1791280000000 };

describe('firestore rules', () => {
  it('denies everything without a (anonymous) session', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'learners/stijn'), learner));
    await assertFails(getDocs(collection(db, 'learners')));
  });

  it('allows creating and updating a learner with a valid key', async () => {
    const db = env.authenticatedContext('anon1').firestore();
    await assertSucceeds(setDoc(doc(db, 'learners/stijn'), learner));
    await assertSucceeds(setDoc(doc(db, 'learners/stijn'), { ...learner, summary: { b1: 10 } }, { merge: true }));
    await assertSucceeds(getDocs(collection(db, 'learners')));
  });

  it('rejects invalid keys and unknown fields', async () => {
    const db = env.authenticatedContext('anon1').firestore();
    await assertFails(setDoc(doc(db, 'learners/Stijn'), learner));
    await assertFails(setDoc(doc(db, 'learners/s'), learner));
    await assertFails(setDoc(doc(db, 'learners/stijn'), { ...learner, admin: true }));
  });

  it('allows adding valid answers, from any anonymous session', async () => {
    const a = env.authenticatedContext('phone').firestore();
    const b = env.authenticatedContext('laptop').firestore();
    await assertSucceeds(addDoc(collection(a, 'learners/stijn/answers'), answer));
    await assertSucceeds(addDoc(collection(b, 'learners/stijn/answers'), answer));
  });

  it('rejects malformed answers', async () => {
    const db = env.authenticatedContext('anon1').firestore();
    await assertFails(addDoc(collection(db, 'learners/stijn/answers'), { ...answer, mode: 'cheat' }));
    await assertFails(addDoc(collection(db, 'learners/stijn/answers'), { ...answer, extra: 1 }));
    await assertFails(addDoc(collection(db, 'learners/stijn/answers'), { ...answer, items: {} }));
  });

  it('never allows updating or deleting answers and test results', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'learners/stijn/answers/a1'), answer);
      await setDoc(doc(ctx.firestore(), 'learners/stijn/tests/t1'), { at: 1, score: 32, total: 40, grade: 8.2, durationMs: 600000 });
      await setDoc(doc(ctx.firestore(), 'learners/stijn'), learner);
    });
    const db = env.authenticatedContext('anon1').firestore();
    await assertFails(updateDoc(doc(db, 'learners/stijn/answers/a1'), { fast: false }));
    await assertFails(deleteDoc(doc(db, 'learners/stijn/answers/a1')));
    await assertFails(updateDoc(doc(db, 'learners/stijn/tests/t1'), { grade: 10 }));
    await assertFails(deleteDoc(doc(db, 'learners/stijn/tests/t1')));
    await assertFails(deleteDoc(doc(db, 'learners/stijn')));
  });

  it('allows adding a valid test result', async () => {
    const db = env.authenticatedContext('anon1').firestore();
    await assertSucceeds(addDoc(collection(db, 'learners/stijn/tests'), { at: 1, score: 32, total: 40, grade: 8.2, durationMs: 600000 }));
  });
});
