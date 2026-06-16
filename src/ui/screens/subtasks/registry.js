import { renderKontoExerciseScreen } from "./kontoExercise.js";
import { renderAccountPlanSearchScreen } from "../accountPlanSearch.js";

// Bereits ausgearbeitete Unteraufgaben, gekeyt mit "<themaNr>/<subNr>".
// Fehlt ein Eintrag, zeigt topicDetail.js den «in Arbeit»-Platzhalter.
export const subtaskScreens = Object.freeze({
  "1/1": renderKontoExerciseScreen,
  "1/3": renderAccountPlanSearchScreen,
});
