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
import { accountPlan } from "../content/accountPlan.js";
import { filterAccounts, getUniqueAccounts } from "../domain/booking.js";
import { calculateExpression } from "../domain/calculator.js";
import { loadProgress, saveAnswer } from "./progress.js";
import { renderMarkdown } from "./markdown.js";
import { ROUTES, hashForRoute, routeFromHash } from "../domain/navigation.js";
import { searchLearningModules } from "../domain/learningModules.js";

const app = document.querySelector("#app");
let currentConfiguration = getInitialConfiguration("finance-complete");
let learningModuleSearchQuery = "";
let learningModuleSearchRequestId = 0;
let learningModuleDocumentsPromise = null;

const theoryModules = Object.freeze([
  // Grundlagen
  { id: "finanzbuchhaltung",             name: "Finanzbuchhaltung" },
  { id: "betriebsbuchhaltung",           name: "Betriebsbuchhaltung" },
  { id: "konto-aufbau",                  name: "Kontoaufbau" },
  { id: "kontoarten",                    name: "Kontoarten" },
  { id: "buchungssaetze",                name: "Buchungssätze" },
  { id: "wb-konti",                      name: "WB-Konten & Minus-Konti" },
  // Abschluss
  { id: "bilanz",                        name: "Bilanz" },
  { id: "erfolgsrechnung",               name: "Erfolgsrechnung" },
  { id: "jahresabschluss",               name: "Jahresabschluss" },
  { id: "abschreibungen",                name: "Abschreibungen" },
  { id: "stille-reserven",               name: "Stille Reserven" },
  { id: "rechnungsabgrenzung",           name: "Rechnungsabgrenzung" },
  { id: "rueckstellungen",               name: "Rückstellungen" },
  { id: "periodenfremde-geschaeftsfaelle", name: "Periodenfremde Geschäftsfälle" },
  // Spezialthemen
  { id: "lohnabrechnung",                name: "Lohnabrechnung" },
  { id: "mehrwertsteuer",                name: "Mehrwertsteuer" },
  { id: "warenhandel",                   name: "Warenhandel" },
  { id: "wertschriften",                 name: "Wertschriften" },
  { id: "fremdwaehrungen",               name: "Fremdwährungen" },
  { id: "konto-privat",                  name: "Konto Privat" },
  { id: "dividendenausschuettung",       name: "Dividendenausschüttung" },
  { id: "kennzahlen",                    name: "Kennzahlen" },
  { id: "alle-konti",                    name: "Alle Konti erklärt" },
  // Rechtsformen
  { id: "einzelunternehmung",            name: "Einzelunternehmung" },
  { id: "kollektivgesellschaft",         name: "Kollektivgesellschaft" },
  { id: "kommanditgesellschaft",         name: "Kommanditgesellschaft" },
  { id: "gmbh",                          name: "GmbH" },
  { id: "aktiengesellschaft",            name: "Aktiengesellschaft (AG)" },
  { id: "gmbh-vs-ag",                    name: "GmbH vs. AG" },
  { id: "genossenschaft",                name: "Genossenschaft" },
  // Recht & Kontrolle
  { id: "revisionsarten",                name: "Revisionsarten" },
  { id: "or-arbeiten",                   name: "Arbeiten mit dem OR" },
]);

window.addEventListener("hashchange", renderCurrentRoute);

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

  document.querySelector('[data-action="play"]').addEventListener("click", () => navigateTo(ROUTES.gameAccountPlan));
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
  renderAccountPlanSearchScreen();
}

export function renderAccountPlanSearchScreen() {
  const section = gameRound.accountPlanSearch;
  app.innerHTML = `
    <section class="screen screen--game" aria-labelledby="account-plan-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">Aufgabe 1 · Kontenplan</p>
              <h2 id="account-plan-title">${escapeHtml(section.title)}</h2>
              <p class="lead">${escapeHtml(section.lead)}</p>
              <p class="task-count">${section.tasks.length} Suchaufgaben</p>
            </div>
            <div class="account-search-list" aria-label="Kontenplan-Suchaufgaben">
              ${section.tasks.map((task, i) => renderAccountPlanSearchTask(task, i)).join("")}
            </div>
            <div class="configuration-actions">
              <button class="primary-action" type="button" id="game-next-button">${escapeHtml(section.nextButtonLabel)}</button>
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(ROUTES.gameBalance));
  initAccountPlanChoices(app.querySelector(".account-search-list"));
}

export function renderBookingTaskScreen() {
  renderBookingTaskListScreen(gameRound.balanceOnlyTasks, {
    eyebrow: "Aufgabe 2 · Schritt 1 von 3",
    nextRoute: ROUTES.gameIncomeIntro,
    nextLabel: gameRound.balanceOnlyTasks.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.balanceOnlyTasks.tasks, accountPlan),
  });
}

export function renderIncomeStatementIntroScreen() {
  app.innerHTML = `
    <section class="screen screen--game" aria-labelledby="income-intro-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">Aufgabe 2 · Schritt 2 von 3</p>
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
    eyebrow: "Aufgabe 2 · Schritt 3 von 3",
    nextRoute: ROUTES.gameInvoices,
    nextLabel: gameRound.mixedTasks.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.mixedTasks.tasks, accountPlan),
  });
}

export function renderInvoiceBookingScreen() {
  renderBookingTaskListScreen(gameRound.invoiceBooking, {
    eyebrow: "Aufgabe 3 · Rechnung kontieren",
    status: "Minimalrunde abgeschlossen. Weitere Rechnungsfälle und MWST können danach ergänzt werden.",
    accounts: getUniqueAccounts(gameRound.invoiceBooking.tasks, accountPlan),
  });
}

function renderBookingTaskListScreen(section, options) {
  app.innerHTML = `
    <section class="screen screen--game" aria-labelledby="game-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">${escapeHtml(options.eyebrow)}</p>
              <h2 id="game-title">${escapeHtml(section.title)}</h2>
              <p class="lead">${escapeHtml(section.lead)}</p>
              <p class="task-count">${section.tasks.length} Buchungssätze</p>
            </div>
            <div class="booking-task-list" aria-label="Buchungsaufgaben">
              ${section.tasks.map((task, i) => renderBookingTask(task, i)).join("")}
            </div>
            <div class="configuration-actions">
              ${options.nextRoute ? `<button class="primary-action" type="button" id="game-next-button">${escapeHtml(options.nextLabel)}</button>` : `<p class="status-line" role="status">${escapeHtml(options.status)}</p>`}
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  if (options.nextRoute) {
    document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(options.nextRoute));
  }

  const taskList = app.querySelector(".booking-task-list");
  initAccountInputs(taskList, options.accounts ?? []);
  initSolutionToggles(taskList);
  initProgressPersistence(taskList);
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

  if (route === ROUTES.game || route === ROUTES.gameAccountPlan) {
    renderAccountPlanSearchScreen();
    return;
  }

  if (route === ROUTES.gameBalance) {
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

  if (route === ROUTES.gameInvoices) {
    renderInvoiceBookingScreen();
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

function renderTaskCardFooter() {
  return `
    <div class="task-card-footer">
      <button type="button" class="solution-toggle-button" aria-expanded="false">Lösung anzeigen</button>
      <button type="button" class="explanation-button" disabled aria-label="Erklärung folgt">Erklärung</button>
    </div>
  `;
}

const accountTypeLabels = Object.freeze({
  active: "Aktivkonto",
  passive: "Passivkonto",
  expense: "Aufwandkonto",
  revenue: "Ertragskonto",
});

function renderAccountPlanSearchTask(task, index) {
  return `
    <article class="account-search-card" data-task-id="${escapeHtml(task.id)}">
      <div class="booking-task-card__head">
        <span class="task-number">${index + 1}</span>
        <p>${escapeHtml(task.scenario)}</p>
      </div>
      <div class="account-choice-grid" role="group" aria-label="Kontovorschläge für Aufgabe ${index + 1}">
        ${task.options.map((option) => renderAccountChoiceButton(task, option)).join("")}
      </div>
      <div class="account-choice-feedback" hidden role="status" aria-live="polite"></div>
    </article>
  `;
}

function renderAccountChoiceButton(task, option) {
  const correct = option.account === task.correctAccount;
  return `
    <button class="account-choice-button" type="button" data-choice-account="${escapeHtml(option.account)}" data-correct="${correct}">
      <span>${escapeHtml(option.account)}</span>
      <small>${escapeHtml(accountTypeLabels[option.type] ?? option.type)}</small>
    </button>
  `;
}

function initAccountPlanChoices(container) {
  const tasksById = new Map(gameRound.accountPlanSearch.tasks.map((task) => [task.id, task]));
  container.querySelectorAll(".account-search-card").forEach((card) => {
    const task = tasksById.get(card.dataset.taskId);
    const feedback = card.querySelector(".account-choice-feedback");

    card.querySelectorAll(".account-choice-button").forEach((button) => {
      button.addEventListener("click", () => {
        card.querySelectorAll(".account-choice-button").forEach((choice) => {
          const selected = choice === button;
          choice.classList.toggle("account-choice-button--selected", selected);
          choice.setAttribute("aria-pressed", String(selected));
        });

        const correct = button.dataset.correct === "true";
        feedback.hidden = false;
        feedback.className = `account-choice-feedback ${correct ? "account-choice-feedback--correct" : "account-choice-feedback--wrong"}`;
        feedback.textContent = `${correct ? "Richtig." : `Noch nicht. Richtige Lösung: ${task.correctAccount}.`} ${task.explanation}`;
      });
    });
  });
}
function renderTaskImage(task) {
  if (!task.image) return "";
  return `
    <figure class="invoice-task-image-frame">
      <img class="invoice-task-image" src="${escapeHtml(task.image.src)}" alt="${escapeHtml(task.image.alt)}">
      <figcaption>Rechnung pruefen und darunter den Buchungssatz eintragen.</figcaption>
    </figure>
  `;
}

function renderBookingTask(task, index) {
  if (task.noBooking) {
    return `
      <article class="booking-task-card" data-task-id="${escapeHtml(task.id)}">
        <div class="booking-task-card__head">
          <span class="task-number">${index + 1}</span>
          <p>${escapeHtml(task.scenario)}</p>
        </div>
        ${renderTaskImage(task)}
        ${renderBookingInputRow(0, false)}
        ${renderTaskCardFooter()}
        <div class="booking-task-solution" hidden aria-label="Musterlösung">
          <div class="solution-row">
            <span class="solution-booking">Keine Buchung — ${escapeHtml(task.noBookingReason)}</span>
          </div>
        </div>
      </article>
    `;
  }

  const isCompound = Boolean(task.bookings);
  const inputsHtml = isCompound
    ? task.bookings.map((_, i) => renderBookingInputRow(i, true)).join("")
    : renderBookingInputRow(0, false);
  const solutionHtml = (isCompound ? task.bookings : [task])
    .map(renderBookingSolutionRow)
    .join("");

  return `
    <article class="booking-task-card" data-task-id="${escapeHtml(task.id)}">
      <div class="booking-task-card__head">
        <span class="task-number">${index + 1}</span>
        <p>${escapeHtml(task.scenario)}</p>
      </div>
      ${renderTaskImage(task)}
      ${inputsHtml}
      ${renderTaskCardFooter()}
      <div class="booking-task-solution" hidden aria-label="Musterlösung">
        ${solutionHtml}
      </div>
    </article>
  `;
}

function renderBookingInputRow(rowIndex, isCompound) {
  return `
    <div class="booking-task-inputs${rowIndex > 0 ? " booking-task-inputs--sub" : ""}">
      ${isCompound ? `<p class="booking-sub-label">Buchung ${rowIndex + 1}</p>` : ""}
      <label class="booking-input-group">
        <span class="booking-input-label">Soll</span>
        <div class="account-field-wrapper">
          <input type="text" class="account-input" data-role="debit"
            placeholder="Konto eingeben …" autocomplete="off" aria-label="Soll-Konto" aria-autocomplete="list">
          <ul class="account-dropdown" role="listbox" aria-label="Kontenvorschläge" hidden></ul>
        </div>
      </label>
      <label class="booking-input-group">
        <span class="booking-input-label">Haben</span>
        <div class="account-field-wrapper">
          <input type="text" class="account-input" data-role="credit"
            placeholder="Konto eingeben …" autocomplete="off" aria-label="Haben-Konto" aria-autocomplete="list">
          <ul class="account-dropdown" role="listbox" aria-label="Kontenvorschläge" hidden></ul>
        </div>
      </label>
      <label class="booking-input-group">
        <span class="booking-input-label">Betrag</span>
        <input type="text" class="amount-input"
          placeholder="CHF 0.00" autocomplete="off" aria-label="Betrag in CHF">
      </label>
    </div>
  `;
}

function renderBookingSolutionRow(booking) {
  return `
    <div class="solution-row">
      <span class="solution-booking">${escapeHtml(accountLabel(booking.debit.account))} / ${escapeHtml(accountLabel(booking.credit.account))}</span>
      <span class="solution-amount">${escapeHtml(booking.amount)}</span>
    </div>
  `;
}

function accountLabel(name) {
  const entry = accountPlan.find((a) => a.name === name);
  return entry ? `${entry.number} ${name}` : name;
}

function renderLernmoduleSidebar() {
  const currentRoute = routeFromHash(window.location.hash);
  const taskItems = [
    { number: "1", name: "Kontenplan", routes: [ROUTES.game, ROUTES.gameAccountPlan] },
    { number: "2", name: "Buchungssätze", routes: [ROUTES.gameBalance, ROUTES.gameIncomeIntro, ROUTES.gameMixed] },
    { number: "3", name: "Rechnungen", routes: [ROUTES.gameInvoices] },
  ];
  const theoryItems = renderTheoryModuleItems(theoryModules);
  const gameItems = taskItems
    .map((item) => {
      const current = item.routes.includes(currentRoute);
      return `
        <li class="lernmodule-item ${current ? "lernmodule-item--current" : ""}"${current ? ' aria-current="step"' : ""}>
          <span class="lernmodule-number">${escapeHtml(item.number)}</span>
          <span class="lernmodule-name">${escapeHtml(item.name)}</span>
        </li>`;
    })
    .join("");

  return `
    <aside class="lernmodule-sidebar" aria-label="Lernmodule">
      <p class="lernmodule-title">Lernmodule</p>
      <label class="lernmodule-search-label" for="lernmodule-search">Suche in Lernmodulen</label>
      <input class="lernmodule-search-input" id="lernmodule-search" type="search" data-learning-module-search autocomplete="off" placeholder="Keyword suchen" value="${escapeHtml(learningModuleSearchQuery)}">
      <p class="lernmodule-search-status" role="status" aria-live="polite">${learningModuleSearchQuery.trim() ? "Suche laeuft ..." : `${theoryModules.length} Lernmodule`}</p>
      <p class="lernmodule-section-label">Theorie</p>
      <ul class="lernmodule-list" data-learning-module-results>${theoryItems}</ul>
      <p class="lernmodule-section-label">Aufgaben</p>
      <ul class="lernmodule-list">${gameItems}</ul>
    </aside>
  `;
}


function renderTheoryModuleItems(modules) {
  return modules.map(renderTheoryModuleItem).join("");
}

function renderTheoryModuleItem(module) {
  return `
    <li class="lernmodule-item lernmodule-item--theory" data-module="${escapeHtml(module.id)}" tabindex="0" role="button" aria-label="${escapeHtml(module.name)} oeffnen">
      <span class="lernmodule-icon">T</span>
      <span class="lernmodule-name">${escapeHtml(module.name)}</span>
    </li>`;
}

function renderLearningModuleEmptyState(query) {
  return `<li class="lernmodule-empty">Kein Lernmodul enthaelt "${escapeHtml(query)}".</li>`;
}

function loadLearningModuleDocuments() {
  if (!learningModuleDocumentsPromise) {
    learningModuleDocumentsPromise = Promise.all(
      theoryModules.map(async (module) => {
        const response = await fetch(`./lernmodule/${module.id}.md`);
        if (!response.ok) throw new Error(`Lernmodul konnte nicht geladen werden: ${module.id}`);
        return Object.freeze({ ...module, markdown: await response.text() });
      }),
    );
  }
  return learningModuleDocumentsPromise;
}

function initLearningModuleSearch() {
  document.body.addEventListener("input", (event) => {
    const input = event.target.closest("[data-learning-module-search]");
    if (!input) return;
    learningModuleSearchQuery = input.value;
    updateLearningModuleSearch(input.closest(".lernmodule-sidebar"), learningModuleSearchQuery);
  });
}

async function updateLearningModuleSearch(sidebar, query) {
  if (!sidebar) return;
  const resultsList = sidebar.querySelector("[data-learning-module-results]");
  const status = sidebar.querySelector(".lernmodule-search-status");
  if (!resultsList || !status) return;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    resultsList.innerHTML = renderTheoryModuleItems(theoryModules);
    status.textContent = `${theoryModules.length} Lernmodule`;
    return;
  }

  const requestId = ++learningModuleSearchRequestId;
  status.textContent = "Suche laeuft ...";

  try {
    const documents = await loadLearningModuleDocuments();
    if (requestId !== learningModuleSearchRequestId) return;
    const results = searchLearningModules(documents, trimmedQuery);
    resultsList.innerHTML = results.length > 0 ? renderTheoryModuleItems(results) : renderLearningModuleEmptyState(trimmedQuery);
    status.textContent = results.length === 1 ? "1 Treffer" : `${results.length} Treffer`;
  } catch {
    if (requestId !== learningModuleSearchRequestId) return;
    resultsList.innerHTML = renderTheoryModuleItems(theoryModules);
    status.textContent = "Suche konnte nicht geladen werden.";
  }
}
function initModuleModal() {
  const overlay = document.createElement("div");
  overlay.className = "module-modal-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="module-modal">
      <div class="module-modal-header">
        <h2 class="module-modal-title"></h2>
        <button type="button" class="module-modal-close" aria-label="Schliessen">✕</button>
      </div>
      <div class="module-modal-body"></div>
    </div>
  `;
  document.querySelector(".app-shell").appendChild(overlay);

  overlay.querySelector(".module-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.body.addEventListener("click", (e) => {
    const item = e.target.closest("[data-module]");
    if (item) openModule(item.dataset.module, item.querySelector(".lernmodule-name").textContent);
  });

  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const item = e.target.closest("[data-module]");
      if (item) {
        e.preventDefault();
        openModule(item.dataset.module, item.querySelector(".lernmodule-name").textContent);
      }
    }
  });

  function openModule(moduleId, title) {
    overlay.querySelector(".module-modal-title").textContent = title;
    overlay.querySelector(".module-modal-body").innerHTML = "<p>Wird geladen …</p>";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";

    fetch(`./lernmodule/${moduleId}.md`)
      .then((r) => r.text())
      .then((md) => { overlay.querySelector(".module-modal-body").innerHTML = renderMarkdown(md); })
      .catch(() => { overlay.querySelector(".module-modal-body").textContent = "Inhalt konnte nicht geladen werden."; });
  }
}

function renderReferenceAction(action) {
  return `<button class="support-popup-button" type="button" data-support-popup="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`;
}

function renderCalculatorAction() {
  return `<button class="support-popup-button" type="button" data-support-popup="calculator">Taschenrechner</button>`;
}

function renderGameSupportActions() {
  return `
    <nav class="game-reference-bar" aria-label="Nachschlagewerke und Werkzeuge">
      ${gameRound.referenceActions.map(renderReferenceAction).join("")}
      ${renderCalculatorAction()}
    </nav>
    <div class="game-buddy-bar">
      <button class="buddy-button" type="button" disabled title="${escapeHtml(gameRound.buddyAction.hint)}">${escapeHtml(gameRound.buddyAction.label)}</button>
    </div>
  `;
}

function initSupportModal() {
  const overlay = document.createElement("div");
  overlay.className = "support-modal-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "support-modal-title");
  overlay.innerHTML = `
    <div class="support-modal">
      <div class="support-modal-header">
        <h2 class="support-modal-title" id="support-modal-title"></h2>
        <button type="button" class="support-modal-close" aria-label="Schliessen">x</button>
      </div>
      <div class="support-modal-body"></div>
    </div>
  `;
  document.querySelector(".app-shell").appendChild(overlay);

  const title = overlay.querySelector(".support-modal-title");
  const body = overlay.querySelector(".support-modal-body");
  const closeButton = overlay.querySelector(".support-modal-close");
  let previousFocus = null;

  closeButton.addEventListener("click", closeSupportModal);
  overlay.addEventListener("click", (event) => {
    const resourceLink = event.target.closest(".support-resource-link");
    if (resourceLink) {
      const resourceUrl = new URL(resourceLink.href, window.location.href).href;
      const opened = window.open(resourceUrl, "_blank");
      if (opened) {
        event.preventDefault();
        opened.opener = null;
      }
      return;
    }
    if (event.target === overlay) closeSupportModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSupportModal();
  });
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-support-popup]");
    if (!button) return;
    openSupportPopup(button.dataset.supportPopup);
  });

  function openSupportPopup(id) {
    previousFocus = document.activeElement;
    if (id === "calculator") {
      title.textContent = "Taschenrechner";
      body.innerHTML = renderCalculatorPopup();
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      initCalculator(overlay);
      overlay.querySelector(".calculator-display").focus();
      return;
    }

    const action = gameRound.referenceActions.find((referenceAction) => referenceAction.id === id);
    if (!action) return;
    title.textContent = action.label;
    body.innerHTML = renderResourcePopup(action);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeSupportModal() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    body.innerHTML = "";
    document.body.style.overflow = "";
    if (previousFocus?.focus) previousFocus.focus();
  }
}

function renderResourcePopup(action) {
  return `
    <div class="support-resource-view">
      <iframe class="support-resource-frame" src="${escapeHtml(action.href)}" title="${escapeHtml(action.label)}"></iframe>
      <a class="support-resource-link" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer">Dokument in neuem Tab oeffnen</a>
    </div>
  `;
}

function renderCalculatorPopup() {
  return `
    <form class="calculator-form" aria-label="Taschenrechner">
      <label class="calculator-label" for="calculator-expression">Rechnung</label>
      <div class="calculator-entry-row">
        <input class="calculator-display" id="calculator-expression" data-calculator-expression inputmode="decimal" autocomplete="off" placeholder="z.B. 565 + 134.10">
        <button class="calculator-evaluate-button" type="submit">Berechnen</button>
      </div>
      <label class="calculator-label" for="calculator-result">Ergebnis</label>
      <div class="calculator-result-row">
        <input class="calculator-result" id="calculator-result" data-calculator-result readonly value="0.00">
        <button class="calculator-copy-button" type="button" data-calculator-copy>Kopieren</button>
      </div>
      <div class="calculator-keypad" aria-label="Taschenrechner-Tasten">
        ${renderCalculatorKeys()}
      </div>
      <p class="calculator-copy-feedback" role="status" aria-live="polite"></p>
    </form>
  `;
}

function renderCalculatorKeys() {
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "+", "(", ")", "⌫", "="];
  return keys
    .map((key) => {
      const action = key === "C" ? "clear" : key === "⌫" ? "backspace" : key === "=" ? "evaluate" : "insert";
      return `<button class="calculator-key" type="button" data-calculator-key="${escapeHtml(key)}" data-calculator-action="${action}">${escapeHtml(key)}</button>`;
    })
    .join("");
}

function initCalculator(container) {
  const form = container.querySelector(".calculator-form");
  const expression = container.querySelector("[data-calculator-expression]");
  const result = container.querySelector("[data-calculator-result]");
  const feedback = container.querySelector(".calculator-copy-feedback");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateAndShowResult();
  });

  container.querySelectorAll("[data-calculator-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.calculatorAction;
      if (action === "clear") {
        expression.value = "";
        result.value = "0.00";
        feedback.textContent = "";
        expression.focus();
        return;
      }
      if (action === "backspace") {
        expression.value = expression.value.slice(0, -1);
        expression.focus();
        return;
      }
      if (action === "evaluate") {
        calculateAndShowResult();
        return;
      }
      expression.value += button.dataset.calculatorKey;
      expression.focus();
    });
  });

  container.querySelector("[data-calculator-copy]").addEventListener("click", async () => {
    const value = result.value === "0.00" && expression.value.trim() ? calculateAndShowResult() : result.value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      feedback.textContent = "Ergebnis kopiert. Du kannst es jetzt mit Ctrl + V einfuegen.";
    } catch {
      result.focus();
      result.select();
      feedback.textContent = "Kopieren wurde blockiert. Das Ergebnis ist markiert und kann manuell kopiert werden.";
    }
  });

  function calculateAndShowResult() {
    try {
      const calculated = calculateExpression(expression.value);
      result.value = calculated.display;
      feedback.textContent = "Ergebnis berechnet.";
      return calculated.display;
    } catch (error) {
      feedback.textContent = error.message;
      return "";
    }
  }
}
function initProgressPersistence(container) {
  const progress = loadProgress();

  container.querySelectorAll(".booking-task-card").forEach((card) => {
    const taskId = card.dataset.taskId;
    const saved = progress[taskId];

    // Restore saved values
    if (saved) {
      const rows = card.querySelectorAll(".booking-task-inputs");
      const savedRows = saved.bookings ?? [saved];
      rows.forEach((row, i) => {
        if (!savedRows[i]) return;
        const b = savedRows[i];
        const debit = row.querySelector('[data-role="debit"]');
        const credit = row.querySelector('[data-role="credit"]');
        const amount = row.querySelector(".amount-input");
        if (debit) debit.value = b.debit ?? "";
        if (credit) credit.value = b.credit ?? "";
        if (amount) amount.value = b.amount ?? "";
      });
    }

    // Collect current card state and save
    function persist() {
      const rows = [...card.querySelectorAll(".booking-task-inputs")];
      const entries = rows.map((row) => ({
        debit: row.querySelector('[data-role="debit"]')?.value ?? "",
        credit: row.querySelector('[data-role="credit"]')?.value ?? "",
        amount: row.querySelector(".amount-input")?.value ?? "",
      }));
      saveAnswer(taskId, rows.length > 1 ? { bookings: entries } : entries[0]);
    }

    card.querySelectorAll(".account-input").forEach((input) => input.addEventListener("change", persist));
    card.querySelectorAll(".amount-input").forEach((input) => input.addEventListener("blur", persist));
  });
}

function initSolutionToggles(container) {
  container.querySelectorAll(".solution-toggle-button").forEach((button) => {
    button.addEventListener("click", () => {
      const solution = button.closest(".booking-task-card").querySelector(".booking-task-solution");
      const show = solution.hidden;
      solution.hidden = !show;
      button.textContent = show ? "Lösung verbergen" : "Lösung anzeigen";
      button.setAttribute("aria-expanded", String(show));
    });
  });
}

function initAccountInputs(container, accounts) {
  container.querySelectorAll(".account-field-wrapper").forEach((wrapper) => {
    const input = wrapper.querySelector(".account-input");
    const dropdown = wrapper.querySelector(".account-dropdown");

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (!q) {
        dropdown.hidden = true;
        return;
      }
      const filtered = filterAccounts(accounts, q);
      if (filtered.length === 0) {
        dropdown.hidden = true;
        return;
      }
      dropdown.innerHTML = filtered
        .map(({ number, name }) =>
          `<li role="option" data-account="${escapeHtml(name)}">${escapeHtml(number)} ${escapeHtml(name)}</li>`,
        )
        .join("");
      dropdown.hidden = false;
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && !dropdown.hidden) {
        const first = dropdown.querySelector("[data-account]");
        if (first) {
          input.value = first.dataset.account;
          dropdown.hidden = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => { dropdown.hidden = true; }, 150);
    });

    dropdown.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const li = event.target.closest("[data-account]");
      if (li) {
        input.value = li.dataset.account;
        dropdown.hidden = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

startApp();
initLearningModuleSearch();
initModuleModal();
initSupportModal();
