// Firebase Web modular SDK via CDN oficial, adequado ao GitHub Pages sem bundler.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const configured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !String(firebaseConfig.apiKey).includes("COLE_AQUI")
);

let app = null;
let auth = null;
let db = null;

if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export function isFirebaseConfigured() {
  return configured;
}

export function observeAuth(callback) {
  if (!configured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function signInUser(email, password) {
  assertConfigured();
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpUser(email, password) {
  assertConfigured();
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  assertConfigured();
  return signOut(auth);
}

export async function loadOfficialQuestions() {
  assertConfigured();
  const snapshot = await getDocs(collection(db, "questions"));
  return snapshot.docs
    .map((item) => item.data())
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function loadQuestionMirror(questionId) {
  assertConfigured();
  const snapshot = await getDoc(doc(db, "mirrors", questionId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function loadUserProgress(uid) {
  assertConfigured();
  const snapshot = await getDoc(doc(db, "users", uid, "state", "progress"));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveUserProgress(uid, progress) {
  assertConfigured();
  await setDoc(
    doc(db, "users", uid, "state", "progress"),
    {
      ...progress,
      syncedAt: serverTimestamp()
    },
    { merge: true }
  );
}

function assertConfigured() {
  if (!configured) throw new Error("Firebase não configurado. Preencha firebase-config.js.");
}
