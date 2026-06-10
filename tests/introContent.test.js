import test from "node:test";
import assert from "node:assert/strict";

import { gameDescription } from "../src/content/gameDescription.js";
import { caseBriefing } from "../src/content/caseBriefing.js";

test("game description is kept in a separate content module", () => {
  assert.equal(gameDescription.title, "FinanceGame");
  assert.ok(gameDescription.lead.includes("interaktives Lernspiel"));
  assert.ok(gameDescription.paragraphs.some((paragraph) => paragraph.includes("Buchungssätze")));
  assert.ok(gameDescription.paragraphs.some((paragraph) => paragraph.includes("Obligationenrecht")));
  assert.equal(gameDescription.nextButtonLabel, "Weiter");
});

test("case briefing addresses the player with capital Du and describes the accounting job", () => {
  const text = [caseBriefing.title, caseBriefing.story].join("\n");

  assert.ok(text.includes("Du"));
  assert.ok(text.includes("Finanzbuchhaltung von A bis Z"));
  assert.ok(text.includes("Handwerksbetrieb"));
  assert.ok(text.includes("Chef"));
  assert.ok(text.includes(caseBriefing.company.name));
});

test("case briefing gives a short task overview and two start actions", () => {
  assert.ok(caseBriefing.tasks.length >= 4);
  assert.ok(caseBriefing.tasks.some((task) => task.includes("Rechnungen")));
  assert.ok(caseBriefing.tasks.some((task) => task.includes("Buchungssätze")));
  assert.deepEqual(caseBriefing.actions, [
    { id: "play", label: "Spielen" },
    { id: "configuration", label: "Spielkonfiguration" },
  ]);
});