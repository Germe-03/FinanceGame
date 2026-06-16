import { gameRound } from "../../content/gameRound.js";
import { ROUTES } from "../../domain/navigation.js";
import { renderProgressBar, updateProgressBar } from "../components/progressBar.js";
import { renderLernmoduleSidebar } from "../components/sidebar.js";
import { renderGameSupportActions } from "../components/supportModal.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

const accountTypeLabels = Object.freeze({
  active: "Aktivkonto",
  passive: "Passivkonto",
  expense: "Aufwandkonto",
  revenue: "Ertragskonto",
});

// Wird sowohl als (verschobene) Unteraufgabe 1.3 «Kaufmännische Kontenbezeichnung»
// aufgerufen — dann mit topic/subtask und Navigation zur Übersicht — als auch
// direkt über die Route spiel/kontenplan (ohne Argumente, alte Chrome).
export function renderAccountPlanSearchScreen(topic, subtask) {
  const section = gameRound.accountPlanSearch;
  const asSubtask = Boolean(topic && subtask);
  const eyebrow = asSubtask ? `${topic.nr} ${topic.title} · Aufgabe ${subtask.nr}` : "Aufgabe 1 · Kontenplan";
  const heading = asSubtask ? subtask.title : section.title;
  const backLabel = asSubtask ? "Zurück zur Übersicht" : "Zurück zum Fallbeschrieb";
  const backRoute = asSubtask ? ROUTES.game : ROUTES.case;
  const nextLabel = asSubtask ? "Zurück zur Übersicht" : section.nextButtonLabel;
  const nextRoute = asSubtask ? ROUTES.game : ROUTES.gameBalance;

  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="account-plan-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">${escapeHtml(backLabel)}</button>
            <div class="game-stage-head">
              <p class="eyebrow">${escapeHtml(eyebrow)}</p>
              <h2 id="account-plan-title">${escapeHtml(heading)}</h2>
              <p class="lead">${escapeHtml(section.lead)}</p>
              ${renderProgressBar(0, section.tasks.length, "Aufgaben beantwortet")}
            </div>
            <div class="account-search-list" aria-label="Kontenplan-Suchaufgaben">
              ${section.tasks.map((task, i) => renderAccountPlanSearchTask(task, i)).join("")}
            </div>
            <div class="configuration-actions">
              <button class="secondary-action" type="button" id="game-next-button">${escapeHtml(nextLabel)}</button>
              <button class="primary-action" type="button" id="account-check-button">Prüfen</button>
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(backRoute));
  document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(nextRoute));
  const cardList = appRoot.querySelector(".account-search-list");
  const state = { checked: false };
  initAccountPlanChoices(cardList, state);
  cardList.addEventListener("click", (event) => {
    if (!event.target.closest(".account-choice-button")) return;
    const flags = [...cardList.querySelectorAll(".account-search-card")].map(
      (card) => card.querySelector(".account-choice-button--selected") !== null,
    );
    updateProgressBar(appRoot, flags);
  });
  document.querySelector("#account-check-button").addEventListener("click", () => {
    state.checked = true;
    const tasksById = new Map(gameRound.accountPlanSearch.tasks.map((task) => [task.id, task]));
    cardList.querySelectorAll(".account-search-card").forEach((card) => {
      showAccountPlanFeedback(card, tasksById.get(card.dataset.taskId));
    });
  });
}

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

function initAccountPlanChoices(container, state) {
  const tasksById = new Map(gameRound.accountPlanSearch.tasks.map((task) => [task.id, task]));
  container.querySelectorAll(".account-search-card").forEach((card) => {
    const task = tasksById.get(card.dataset.taskId);

    card.querySelectorAll(".account-choice-button").forEach((button) => {
      button.addEventListener("click", () => {
        card.querySelectorAll(".account-choice-button").forEach((choice) => {
          const selected = choice === button;
          choice.classList.toggle("account-choice-button--selected", selected);
          choice.setAttribute("aria-pressed", String(selected));
        });

        // Feedback erst nach «Prüfen»; danach aktualisiert es sich bei Änderung.
        if (state.checked) showAccountPlanFeedback(card, task);
      });
    });
  });
}

// Blendet bei einer Aufgaben-Card das Feedback ein und markiert die richtige
// Lösung (grün) bzw. eine falsch gewählte Option (rot).
function showAccountPlanFeedback(card, task) {
  const feedback = card.querySelector(".account-choice-feedback");
  const selected = card.querySelector(".account-choice-button--selected");

  card.querySelectorAll(".account-choice-button").forEach((button) => {
    const isCorrect = button.dataset.correct === "true";
    button.classList.toggle("account-choice-button--correct", isCorrect);
    button.classList.toggle("account-choice-button--wrong", button === selected && !isCorrect);
  });

  feedback.hidden = false;
  if (!selected) {
    feedback.className = "account-choice-feedback account-choice-feedback--wrong";
    feedback.textContent = `Noch nicht beantwortet. Richtige Lösung: ${task.correctAccount}. ${task.explanation}`;
  } else {
    const correct = selected.dataset.correct === "true";
    feedback.className = `account-choice-feedback ${correct ? "account-choice-feedback--correct" : "account-choice-feedback--wrong"}`;
    feedback.textContent = `${correct ? "Richtig." : `Noch nicht. Richtige Lösung: ${task.correctAccount}.`} ${task.explanation}`;
  }
}
