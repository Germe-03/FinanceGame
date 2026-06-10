import test from "node:test";
import assert from "node:assert/strict";

import { configurationDifficulties, configurationModules, standardConfigurationModes } from "../src/content/gameConfiguration.js";
import {
  getDifficultyById,
  getInitialConfiguration,
  getVisibleModeTitle,
  setConfigurationDifficulty,
  setModuleEnabled,
} from "../src/domain/configuration.js";

test("configuration provides three standard modes and shared modules", () => {
  assert.deepEqual(standardConfigurationModes.map((mode) => mode.title), [
    "Finanzkomplett",
    "Finanzmanagement",
    "Grundlagen Finanzen",
  ]);

  const moduleIds = configurationModules.map((module) => module.id);
  assert.ok(moduleIds.includes("write-booking-entries"));
  assert.ok(configurationModules.some((module) => module.label === "Buchungssätze selber schreiben"));

  for (const mode of standardConfigurationModes) {
    assert.deepEqual(Object.keys(mode.defaults).sort(), moduleIds.toSorted());
  }
});

test("configuration provides three difficulty levels for learning progression", () => {
  assert.deepEqual(configurationDifficulties.map((difficulty) => difficulty.title), [
    "Beginner",
    "Fortgeschritten",
    "Experte",
  ]);

  const beginner = getDifficultyById("beginner");
  assert.equal(beginner.id, "beginner");
  assert.match(beginner.description, /Aktiv- und Passivbuchungen/);
  assert.match(beginner.description, /Erfolgsrechnung.*später/);
});

test("initial configuration uses the selected standard mode and beginner difficulty", () => {
  const configuration = getInitialConfiguration("finance-management");

  assert.equal(configuration.modeId, "finance-management");
  assert.equal(configuration.difficultyId, "beginner");
  assert.equal(getVisibleModeTitle(configuration), "Finanzmanagement");
  assert.equal(configuration.custom, false);
});

test("changing difficulty keeps the selected preset and module custom state", () => {
  const configuration = getInitialConfiguration("basic-finance");
  const changed = setConfigurationDifficulty(configuration, "expert");

  assert.equal(changed.modeId, "basic-finance");
  assert.equal(changed.difficultyId, "expert");
  assert.equal(changed.custom, false);
  assert.equal(getVisibleModeTitle(changed), "Grundlagen Finanzen");
  assert.deepEqual(changed.moduleStates, configuration.moduleStates);
});

test("changing a module away from the preset switches visible title to Benutzerdefiniert", () => {
  const configuration = getInitialConfiguration("finance-complete");
  const changed = setModuleEnabled(configuration, "write-booking-entries", false);

  assert.equal(changed.custom, true);
  assert.equal(getVisibleModeTitle(changed), "Benutzerdefiniert");
  assert.equal(changed.moduleStates["write-booking-entries"], false);
});

test("changing a module back to the preset restores the standard mode title", () => {
  const configuration = getInitialConfiguration("basic-finance");
  const changed = setModuleEnabled(configuration, "search-or-articles", true);
  const restored = setModuleEnabled(changed, "search-or-articles", false);

  assert.equal(getVisibleModeTitle(changed), "Benutzerdefiniert");
  assert.equal(restored.custom, false);
  assert.equal(getVisibleModeTitle(restored), "Grundlagen Finanzen");
});