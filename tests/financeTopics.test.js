import test from "node:test";
import assert from "node:assert/strict";

import { gameRound } from "../src/content/gameRound.js";

const EXPECTED_TOPICS = [
  "Kaufmännische Buchführung",
  "System der doppelten Buchführung",
  "Rechnungsabschluss und Kontenrahmen",
  "Geschäfte mit der Bank",
  "Fremde Währungen",
  "Buchhaltung des Warenhandelsbetriebs",
  "Mehrwertsteuer",
  "Betriebliche Kalkulation",
  "Verluste auf Forderungen",
  "Abschreibungen",
  "Rechnungsabgrenzungen",
  "Personalaufwand",
  "Besonderheiten des Einzelunternehmens",
  "Besonderheiten der Aktiengesellschaft",
  "Grundsätze der Bewertung",
  "Wertschriften",
  "Liegenschaften",
  "Analyse der Bilanz und Erfolgsrechnung",
  "Geldflussrechnung",
  "Betriebsbuchhaltung",
  "Deckungsbeitragsrechnung/Break-even-Analyse",
];

test("finance topics list every chapter from the textbook in order", () => {
  const { financeTopics } = gameRound;
  assert.equal(financeTopics.section, "Finanzwirtschaftliche Zusammenhänge");
  assert.equal(financeTopics.topics.length, 21);
  assert.deepEqual(financeTopics.topics.map((topic) => topic.title), EXPECTED_TOPICS);
});

test("each finance topic is numbered 1..21 and routes to its own task", () => {
  gameRound.financeTopics.topics.forEach((topic, index) => {
    assert.equal(topic.nr, index + 1);
    assert.equal(topic.route, `spiel/thema/${index + 1}`);
    assert.ok(Array.isArray(topic.subtasks), `topic ${topic.nr} must expose a subtasks array`);
  });
});

test("topics 1 and 2 expose their sub-tasks with sequential routes", () => {
  const topics = gameRound.financeTopics.topics;

  const buchfuehrung = topics.find((topic) => topic.nr === 1);
  assert.deepEqual(buchfuehrung.subtasks.map((subtask) => subtask.title), [
    "Konto",
    "Bestandeskonten (Aktive / Passiven)",
    "Kaufmännische Kontenbezeichnung",
    "Theoriefragen Richtig/Falsch",
    "Fachausdrücke",
  ]);

  const doppelteBuchfuehrung = topics.find((topic) => topic.nr === 2);
  assert.deepEqual(doppelteBuchfuehrung.subtasks.map((subtask) => subtask.title), [
    "Konteneinträge durchführen und Buchungssätze bilden",
    "Journal und Hauptbuch führen",
    "Buchungssätze bestimmen",
    "Buchungssätze anhand Rechnung bestimmen",
    "Buchungstatsachen bestimmen",
    "Auswirkungen von Geschäftsfällen auf die Bestandeskonten bestimmen",
    "Aufwand und Ertrag, Wertverbrauch und Wertzuwachs",
    "Aufwandkonto & Ertragskonto führen",
    "Verbuchen von Rabatt und Skonto",
  ]);

  buchfuehrung.subtasks.forEach((subtask, index) => {
    assert.equal(subtask.nr, index + 1);
    assert.equal(subtask.route, `spiel/thema/1/${index + 1}`);
  });
  doppelteBuchfuehrung.subtasks.forEach((subtask, index) => {
    assert.equal(subtask.route, `spiel/thema/2/${index + 1}`);
  });

  // Themen ohne ausgearbeitete Unteraufgaben haben eine leere Liste.
  assert.equal(topics.find((topic) => topic.nr === 3).subtasks.length, 0);
});

test("legacy tasks bundle the not-yet-migrated exercises (1 -> 1.3, 3 -> 2.4)", () => {
  const { legacyTasks } = gameRound;
  assert.equal(legacyTasks.title, "Alte Aufgaben");
  assert.equal(legacyTasks.tasks.length, 3);
  assert.deepEqual(
    legacyTasks.tasks.map((task) => task.route),
    ["spiel/aktiv-passiv", "spiel/t-konto", "spiel/mwst/zuordnen"],
  );
  // Verschoben: Kontenplan-Suche → Thema 1.3, Rechnungen kontieren → Thema 2.4.
  assert.ok(!legacyTasks.tasks.some((task) => task.route === "spiel/kontenplan"));
  assert.ok(!legacyTasks.tasks.some((task) => task.route === "spiel/rechnungen"));
  for (const task of legacyTasks.tasks) {
    assert.ok(task.title.length > 0, "legacy task needs a title");
  }
});
