import { renderKontoExerciseScreen } from "./kontoExercise.js";
import { renderAccountPlanSearchScreen } from "../accountPlanSearch.js";
import { renderTheoriefragenScreen } from "./theoriefragen.js";
import { renderInvoiceBookingSubtaskScreen } from "../bookingTasks.js";

// Bereits ausgearbeitete Unteraufgaben, gekeyt mit "<themaNr>/<subNr>".
// Fehlt ein Eintrag, zeigt topicDetail.js den «in Arbeit»-Platzhalter.
export const subtaskScreens = Object.freeze({
  "1/1": renderKontoExerciseScreen,
  "1/3": renderAccountPlanSearchScreen,
  "1/4": renderTheoriefragenScreen,
  "2/4": renderInvoiceBookingSubtaskScreen,
});
