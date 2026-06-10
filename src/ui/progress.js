// TODO: localStorage durch serverseitige Speicherung ersetzen.
// Ziel: POST /api/progress mit { taskId, answer } → schreibt in progress.json auf dem Server.
//       GET  /api/progress → liest den gespeicherten Fortschritt.
// Dann diese Datei entfernen und die Imports in app.js anpassen.

const STORAGE_KEY = "financeGame.progress";

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveAnswer(taskId, answer) {
  const all = loadProgress();
  all[taskId] = answer;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
