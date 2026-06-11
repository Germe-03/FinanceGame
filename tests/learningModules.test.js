import test from "node:test";
import assert from "node:assert/strict";

import { searchLearningModules } from "../src/domain/learningModules.js";

const modules = Object.freeze([
  Object.freeze({ id: "bilanz", name: "Bilanz", markdown: "# Bilanz\nAktiven und Passiven zeigen die Vermoegenslage." }),
  Object.freeze({ id: "rueckstellungen", name: "Rueckstellungen", markdown: "# Rueckstellungen\nRückstellungen decken unsichere Verpflichtungen ab." }),
  Object.freeze({ id: "titel-only", name: "Mehrwertsteuer", markdown: "# Umsatzsteuer\nDieser Text enthaelt den gesuchten Modultitel nicht." }),
]);

test("learning module search returns all modules for an empty keyword", () => {
  assert.deepEqual(
    searchLearningModules(modules, "   "),
    [
      { id: "bilanz", name: "Bilanz" },
      { id: "rueckstellungen", name: "Rueckstellungen" },
      { id: "titel-only", name: "Mehrwertsteuer" },
    ],
  );
});

test("learning module search finds a keyword anywhere in markdown content", () => {
  assert.deepEqual(searchLearningModules(modules, "PASSIVEN"), [
    { id: "bilanz", name: "Bilanz" },
  ]);
});

test("learning module search is umlaut tolerant", () => {
  assert.deepEqual(searchLearningModules(modules, "ruckstellungen"), [
    { id: "rueckstellungen", name: "Rueckstellungen" },
  ]);
});

test("learning module search ignores module names when the keyword is not in the markdown", () => {
  assert.deepEqual(searchLearningModules(modules, "Mehrwertsteuer"), []);
});