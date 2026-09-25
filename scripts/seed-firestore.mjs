import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = resolve(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const [questionsRaw, mirrorsRaw] = await Promise.all([
  readFile(resolve(root, "data/questoes.json"), "utf8"),
  readFile(resolve(root, "data/espelhos.json"), "utf8")
]);

const questions = JSON.parse(questionsRaw);
const mirrors = JSON.parse(mirrorsRaw);

if (questions.length !== 60 || mirrors.length !== 60) {
  throw new Error(`Esperados 60 enunciados e 60 espelhos. Recebidos: ${questions.length}/${mirrors.length}.`);
}

if (dryRun) {
  console.log(`DRY RUN: ${questions.length} documentos em questions e ${mirrors.length} em mirrors.`);
  console.log("Primeiro ID:", questions[0].id, "| Último ID:", questions.at(-1).id);
  process.exit(0);
}

const serviceAccountPath = resolve(root, "serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf8"));
} catch {
  throw new Error(
    "Arquivo serviceAccountKey.json não encontrado na raiz. Gere a chave em Firebase Console > Configurações do projeto > Contas de serviço. NÃO faça commit desse arquivo."
  );
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const batch = db.batch();

for (const question of questions) {
  const { id, ...data } = question;
  batch.set(db.collection("questions").doc(id), {
    ...data,
    id,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

for (const mirror of mirrors) {
  const { id, ...data } = mirror;
  batch.set(db.collection("mirrors").doc(id), {
    ...data,
    id,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

await batch.commit();
console.log(`OK: ${questions.length} questões e ${mirrors.length} espelhos enviados ao Firestore.`);
