import { configurationDifficulties, configurationModules, standardConfigurationModes } from "../../content/gameConfiguration.js";
import {
  getInitialConfiguration,
  getVisibleModeTitle,
  setConfigurationDifficulty,
  setConfigurationMode,
  setModuleEnabled,
} from "../../domain/configuration.js";
import { ROUTES } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

let currentConfiguration = getInitialConfiguration("finance-complete");

export function renderConfigurationScreen() {
  appRoot.innerHTML = `
    <section class="screen screen--configuration" aria-labelledby="configuration-title">
      <div class="screen__content screen__content--wide">
        <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
        <div class="configuration-head">
          <div>
            <p class="eyebrow">Spielkonfiguration</p>
            <h2 id="configuration-title">${escapeHtml(getVisibleModeTitle(currentConfiguration))}</h2>
            <p class="lead">Stelle ein, was Du selbst machen möchtest und was das Spiel standardmässig für Dich vorbereitet.</p>
          </div>
        </div>

        <div class="configuration-choices">
          <section class="configuration-choice-group" aria-labelledby="mode-title">
            <h3 id="mode-title">Voreinstellung</h3>
            <div class="mode-grid" aria-label="Standardmodi">
              ${standardConfigurationModes.map(renderModeButton).join("")}
            </div>
          </section>

          <section class="configuration-choice-group" aria-labelledby="difficulty-title">
            <div class="configuration-section-title">
              <h3 id="difficulty-title">Schwierigkeitsgrad</h3>
              <button class="difficulty-help-button" type="button" disabled aria-label="Erklärung der Schwierigkeitsgrade folgt" title="Erklärung folgt">?</button>
            </div>
            <div class="difficulty-grid" aria-label="Schwierigkeitsgrad">
              ${configurationDifficulties.map(renderDifficultyButton).join("")}
            </div>
          </section>
        </div>

        <div class="module-list" aria-label="Module">
          ${configurationModules.map(renderModuleRow).join("")}
        </div>

        <div class="configuration-actions">
          <button class="primary-action" type="button" id="apply-configuration">Einstellungen übernehmen</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelector("#apply-configuration").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelectorAll("[data-mode-id]").forEach((button) => {
    button.addEventListener("click", () => {
      currentConfiguration = setConfigurationMode(currentConfiguration, button.dataset.modeId);
      renderConfigurationScreen();
    });
  });
  document.querySelectorAll("[data-difficulty-id]").forEach((button) => {
    button.addEventListener("click", () => {
      currentConfiguration = setConfigurationDifficulty(currentConfiguration, button.dataset.difficultyId);
      renderConfigurationScreen();
    });
  });
  document.querySelectorAll("[data-module-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.dataset.moduleId;
      const enabled = currentConfiguration.moduleStates[moduleId];
      currentConfiguration = setModuleEnabled(currentConfiguration, moduleId, !enabled);
      renderConfigurationScreen();
    });
  });
}

function renderModeButton(mode) {
  const selected = mode.id === currentConfiguration.modeId && !currentConfiguration.custom;
  return `
    <button type="button" class="mode-button ${selected ? "mode-button--selected" : ""}" data-mode-id="${escapeHtml(mode.id)}" aria-pressed="${selected}">
      <span>${escapeHtml(mode.title)}</span>
      <small>${escapeHtml(mode.description)}</small>
    </button>
  `;
}

function renderDifficultyButton(difficulty) {
  const selected = difficulty.id === currentConfiguration.difficultyId;
  return `
    <button type="button" class="difficulty-button ${selected ? "difficulty-button--selected" : ""}" data-difficulty-id="${escapeHtml(difficulty.id)}" aria-pressed="${selected}">
      <span>${escapeHtml(difficulty.title)}</span>
      <small>${escapeHtml(difficulty.description)}</small>
    </button>
  `;
}

function renderModuleRow(module) {
  const enabled = currentConfiguration.moduleStates[module.id];
  return `
    <div class="module-row">
      <div>
        <h3>${escapeHtml(module.label)}</h3>
        <p>${escapeHtml(module.description)}</p>
      </div>
      <button type="button" class="switch-button ${enabled ? "switch-button--on" : ""}" data-module-id="${escapeHtml(module.id)}" aria-pressed="${enabled}">
        ${enabled ? "Ein" : "Aus"}
      </button>
    </div>
  `;
}
