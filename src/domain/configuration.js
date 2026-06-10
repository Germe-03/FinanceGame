import { configurationDifficulties, configurationModules, standardConfigurationModes } from "../content/gameConfiguration.js";

export function getInitialConfiguration(modeId = "finance-complete", difficultyId = "beginner") {
  const mode = getModeById(modeId);
  const difficulty = getDifficultyById(difficultyId);
  return buildConfiguration(mode.id, mode.defaults, difficulty.id);
}

export function getModeById(modeId) {
  return standardConfigurationModes.find((mode) => mode.id === modeId) ?? standardConfigurationModes[0];
}

export function getDifficultyById(difficultyId) {
  return configurationDifficulties.find((difficulty) => difficulty.id === difficultyId) ?? configurationDifficulties[0];
}

export function setConfigurationMode(configurationOrModeId, maybeModeId) {
  if (typeof configurationOrModeId === "object") {
    return getInitialConfiguration(maybeModeId, configurationOrModeId.difficultyId);
  }

  return getInitialConfiguration(configurationOrModeId);
}

export function setConfigurationDifficulty(configuration, difficultyId) {
  const difficulty = getDifficultyById(difficultyId);
  return buildConfiguration(configuration.modeId, configuration.moduleStates, difficulty.id);
}

export function setModuleEnabled(configuration, moduleId, enabled) {
  const nextStates = {
    ...configuration.moduleStates,
    [moduleId]: Boolean(enabled),
  };

  return buildConfiguration(configuration.modeId, nextStates, configuration.difficultyId);
}

export function getVisibleModeTitle(configuration) {
  if (configuration.custom) return "Benutzerdefiniert";
  return getModeById(configuration.modeId).title;
}

function buildConfiguration(modeId, moduleStates, difficultyId = "beginner") {
  const normalizedStates = normalizeModuleStates(moduleStates);
  const mode = getModeById(modeId);
  const custom = !sameStates(normalizedStates, mode.defaults);

  return {
    modeId: mode.id,
    difficultyId: getDifficultyById(difficultyId).id,
    custom,
    moduleStates: normalizedStates,
  };
}

function normalizeModuleStates(moduleStates) {
  return Object.fromEntries(configurationModules.map((module) => [module.id, Boolean(moduleStates?.[module.id])]));
}

function sameStates(left, right) {
  return configurationModules.every((module) => Boolean(left[module.id]) === Boolean(right[module.id]));
}