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

export function renderAccountPlanSearchScreen() {
  const section = gameRound.accountPlanSearch;
  appRoot.innerHTML = `
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
              ${renderProgressBar(0, section.tasks.length, "Aufgaben beantwortet")}
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
  const cardList = appRoot.querySelector(".account-search-list");
  initAccountPlanChoices(cardList);
  cardList.addEventListener("click", (event) => {
    if (!event.target.closest(".account-choice-button")) return;
    const flags = [...cardList.querySelectorAll(".account-search-card")].map(
      (card) => card.querySelector(".account-choice-button--selected") !== null,
    );
    updateProgressBar(appRoot, flags);
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
