import { gameDescription } from "../content/gameDescription.js";
import { caseBriefing } from "../content/caseBriefing.js";
import { configurationDifficulties, configurationModules, standardConfigurationModes } from "../content/gameConfiguration.js";
import { gameRound } from "../content/gameRound.js";
import {
  getInitialConfiguration,
  getVisibleModeTitle,
  setConfigurationDifficulty,
  setConfigurationMode,
  setModuleEnabled,
} from "../domain/configuration.js";
import { ROUTES, hashForRoute, routeFromHash } from "../domain/navigation.js";

const app = document.querySelector("#app");
let currentConfiguration = getInitialConfiguration("finance-complete");

window.addEventListener("hashchange", renderCurrentRoute);
startApp();

export function renderDescriptionScreen() {
  app.innerHTML = `
    <section class="screen screen--intro" aria-labelledby="intro-title">
      <div class="screen__content">
        <p class="eyebrow">Finanzbuchhaltung lernen</p>
        <h2 id="intro-title">${escapeHtml(gameDescription.title)}</h2>
        <p class="lead">${escapeHtml(gameDescription.lead)}</p>
        <div class="text-stack">
          ${gameDescription.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
        <div class="goal-list" aria-label="Lernziele">
          ${gameDescription.learningGoals.map((goal) => `<span>${escapeHtml(goal)}</span>`).join("")}
        </div>
        <button class="primary-action" type="button" id="continue-button">${escapeHtml(gameDescription.nextButtonLabel)}</button>
      </div>
    </section>
  `;

  document.querySelector("#continue-button").addEventListener("click", () => navigateTo(ROUTES.case));
}

export function renderCaseScreen() {
  app.innerHTML = `
    <section class="screen screen--case" aria-labelledby="case-title">
      <div class="screen__content screen__content--wide">
        <div class="case-layout">
          <div class="case-main">
            <p class="eyebrow">${escapeHtml(caseBriefing.company.trade)}</p>
            <h2 id="case-title">${escapeHtml(caseBriefing.title)}</h2>
            <p class="company-line">${escapeHtml(caseBriefing.company.name)} · ${escapeHtml(caseBriefing.company.size)} · ${escapeHtml(caseBriefing.company.location)}</p>
            <p class="story">${escapeHtml(caseBriefing.story)}</p>
          </div>
          <aside class="task-panel" aria-labelledby="tasks-title">
            <h3 id="tasks-title">${escapeHtml(caseBriefing.tasksIntro)}</h3>
            <ul>
              ${caseBriefing.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}
            </ul>
            <div class="action-row">
              ${caseBriefing.actions.map((action) => `<button type="button" class="${action.id === "play" ? "primary-action" : "secondary-action"}" data-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`).join("")}
            </div>
            <p class="status-line" id="action-status" role="status" aria-live="polite"></p>
          </aside>
        </div>
      </div>
    </section>
  `;

  document.querySelector('[data-action="play"]').addEventListener("click", () => navigateTo(ROUTES.gameBalance));
  document.querySelector('[data-action="configuration"]').addEventListener("click", () => navigateTo(ROUTES.configuration));
}

export function renderConfigurationScreen() {
  app.innerHTML = `
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

export function renderGameScreen() {
  renderBookingTaskScreen();
}

export function renderBookingTaskScreen() {
  renderBookingTaskListScreen(gameRound.balanceOnlyTasks, {
    eyebrow: "Aufgabe 1 · Schritt 1 von 3",
    nextRoute: ROUTES.gameIncomeIntro,
    nextLabel: gameRound.balanceOnlyTasks.nextButtonLabel,
  });
}

export function renderIncomeStatementIntroScreen() {
  app.innerHTML = `
    <section class="screen screen--game" aria-labelledby="income-intro-title">
      <div class="screen__content screen__content--wide game-shell">
        <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
        <div class="game-stage-head">
          <p class="eyebrow">Aufgabe 1 · Schritt 2 von 3</p>
          <h2 id="income-intro-title">${escapeHtml(gameRound.incomeStatementIntro.title)}</h2>
          <p class="lead">${escapeHtml(gameRound.incomeStatementIntro.body)}</p>
        </div>
        <div class="intro-panel" aria-label="Übergang zur Erfolgsrechnung">
          <h3>Merke Dir für die nächsten Aufgaben</h3>
          <ul>
            <li>Aufwand steht typischerweise im Soll.</li>
            <li>Ertrag steht typischerweise im Haben.</li>
            <li>Aktiv- und Passivkonten bleiben weiterhin Teil vieler Buchungssätze.</li>
          </ul>
        </div>
        <div class="configuration-actions">
          <button class="primary-action" type="button" id="game-next-button">${escapeHtml(gameRound.incomeStatementIntro.nextButtonLabel)}</button>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(ROUTES.gameMixed));
}

export function renderMixedBookingTaskScreen() {
  renderBookingTaskListScreen(gameRound.mixedTasks, {
    eyebrow: "Aufgabe 1 · Schritt 3 von 3",
    status: "Aufgabe 1 endet nach diesen 40 gemischten Buchungssätzen.",
  });
}

function renderBookingTaskListScreen(section, options) {
  app.innerHTML = `
    <section class="screen screen--game" aria-labelledby="game-title">
      <div class="screen__content screen__content--wide game-shell">
        <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
        <div class="game-stage-head">
          <p class="eyebrow">${escapeHtml(options.eyebrow)}</p>
          <h2 id="game-title">${escapeHtml(section.title)}</h2>
          <p class="lead">${escapeHtml(section.lead)}</p>
          <p class="task-count">${section.tasks.length} Buchungssätze</p>
        </div>
        <div class="booking-task-list" aria-label="Buchungsaufgaben">
          ${section.tasks.map(renderBookingTask).join("")}
        </div>
        <div class="configuration-actions">
          ${options.nextRoute ? `<button class="primary-action" type="button" id="game-next-button">${escapeHtml(options.nextLabel)}</button>` : `<p class="status-line" role="status">${escapeHtml(options.status)}</p>`}
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  if (options.nextRoute) {
    document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(options.nextRoute));
  }
}

function startApp() {
  const route = routeFromHash(window.location.hash);
  const canonicalHash = hashForRoute(route);
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }
  renderRoute(route);
}

function renderCurrentRoute() {
  renderRoute(routeFromHash(window.location.hash));
}

function navigateTo(route) {
  const nextHash = hashForRoute(route);
  if (window.location.hash === nextHash) {
    renderRoute(route);
    return;
  }
  window.location.hash = nextHash;
}

function renderRoute(route) {
  if (route === ROUTES.case) {
    renderCaseScreen();
    return;
  }

  if (route === ROUTES.configuration) {
    renderConfigurationScreen();
    return;
  }

  if (route === ROUTES.game || route === ROUTES.gameBalance) {
    renderBookingTaskScreen();
    return;
  }

  if (route === ROUTES.gameIncomeIntro) {
    renderIncomeStatementIntroScreen();
    return;
  }

  if (route === ROUTES.gameMixed) {
    renderMixedBookingTaskScreen();
    return;
  }

  renderDescriptionScreen();
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

function renderBookingTask(task, index) {
  return `
    <article class="booking-task-card">
      <div class="booking-task-card__head">
        <span class="task-number">${index + 1}</span>
        <p>${escapeHtml(task.scenario)}</p>
      </div>
      <div class="booking-entry">
        <span>${escapeHtml(task.amount)}</span>
        <strong>${escapeHtml(task.debit.account)} / ${escapeHtml(task.credit.account)}</strong>
      </div>
      <div class="account-type-line">
        <span>Soll: ${escapeHtml(accountTypeLabels[task.debit.type])}</span>
        <span>Haben: ${escapeHtml(accountTypeLabels[task.credit.type])}</span>
      </div>
    </article>
  `;
}

function renderReferenceAction(action) {
  return `<a class="resource-button" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(action.label)}</a>`;
}

function renderGameSupportActions() {
  return `
    <nav class="game-reference-bar" aria-label="Nachschlagewerke">
      ${gameRound.referenceActions.map(renderReferenceAction).join("")}
    </nav>
    <div class="game-buddy-bar">
      <button class="buddy-button" type="button" disabled title="${escapeHtml(gameRound.buddyAction.hint)}">${escapeHtml(gameRound.buddyAction.label)}</button>
    </div>
  `;
}

const accountTypeLabels = Object.freeze({
  active: "Aktivkonto",
  passive: "Passivkonto",
  expense: "Aufwandkonto",
  revenue: "Ertragskonto",
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}