import { accountPlan } from "../../content/accountPlan.js";
import { gameRound } from "../../content/gameRound.js";
import { getUniqueAccounts } from "../../domain/booking.js";
import { ROUTES } from "../../domain/navigation.js";
import { renderBookingTaskListScreen } from "./bookingTasks.js";
import { renderChoiceTaskScreen } from "./choiceTasks.js";
import { renderTKontoScreen } from "./tKonto.js";

export function renderMwstClassifyScreen() {
  renderChoiceTaskScreen(gameRound.mwst.classification, {
    eyebrow: "Aufgabe 5 · Schritt 1 von 5",
    nextRoute: ROUTES.gameMwstBooking,
    nextLabel: gameRound.mwst.classification.nextButtonLabel,
  });
}

export function renderMwstBookingScreen() {
  renderBookingTaskListScreen(gameRound.mwst.bookingsBasic, {
    eyebrow: "Aufgabe 5 · Schritt 2 von 5",
    nextRoute: ROUTES.gameMwstVorsteuer,
    nextLabel: gameRound.mwst.bookingsBasic.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.mwst.bookingsBasic.tasks, accountPlan),
  });
}

export function renderMwstVorsteuerScreen() {
  renderChoiceTaskScreen(gameRound.mwst.vorsteuerSplit, {
    eyebrow: "Aufgabe 5 · Schritt 3 von 5",
    nextRoute: ROUTES.gameMwstBookingPro,
    nextLabel: gameRound.mwst.vorsteuerSplit.nextButtonLabel,
  });
}

export function renderMwstAdvancedBookingScreen() {
  renderBookingTaskListScreen(gameRound.mwst.bookingsAdvanced, {
    eyebrow: "Aufgabe 5 · Schritt 4 von 5",
    nextRoute: ROUTES.gameMwstTKonto,
    nextLabel: gameRound.mwst.bookingsAdvanced.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.mwst.bookingsAdvanced.tasks, accountPlan),
  });
}

export function renderMwstTKontoScreen() {
  renderTKontoScreen(gameRound.mwst.tKonto, { eyebrow: "Aufgabe 5 · Schritt 5 von 5" });
}
