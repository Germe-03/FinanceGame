import { renderKontoExerciseScreen } from "./kontoExercise.js";

// Bereits ausgearbeitete Unteraufgaben, gekeyt mit "<themaNr>/<subNr>".
// Fehlt ein Eintrag, zeigt topicDetail.js den «in Arbeit»-Platzhalter.
export const subtaskScreens = Object.freeze({
  "1/1": renderKontoExerciseScreen,
});
