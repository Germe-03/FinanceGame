import { ROUTES } from "../../domain/navigation.js";
import { renderLernmoduleSidebar } from "../components/sidebar.js";
import { renderGameSupportActions } from "../components/supportModal.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

// Generischer Zuordnungs-Screen: pro Szenario-Card wählt der User eine der
// section.choiceOptions ({id, label, hint}); task.correct nennt die richtige id.
export function renderChoiceTaskScreen(section, options) {
  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="choice-task-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">${escapeHtml(options.eyebrow)}</p>
              <h2 id="choice-task-title">${escapeHtml(section.title)}</h2>
              <p class="lead">${escapeHtml(section.lead)}</p>
              <p class="task-count">${section.tasks.length} Zuordnungsaufgaben</p>
            </div>
            <div class="account-search-list" aria-label="Zuordnungsaufgaben">
              ${section.tasks.map((task, i) => renderChoiceCard(task, section, i)).join("")}
            </div>
            <div class="configuration-actions">
              <button class="primary-action" type="button" id="game-next-button">${escapeHtml(options.nextLabel)}</button>
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(options.nextRoute));
  initChoiceCards(appRoot.querySelector(".account-search-list"), section);
}

function renderChoiceCard(task, section, index) {
  return `
    <article class="account-search-card" data-task-id="${escapeHtml(task.id)}">
      <div class="booking-task-card__head">
        <span class="task-number">${index + 1}</span>
        <p>${escapeHtml(task.scenario)}</p>
      </div>
      <div class="account-choice-grid" role="group" aria-label="Antwortmöglichkeiten für Aufgabe ${index + 1}">
        ${section.choiceOptions.map((option) => `
          <button class="account-choice-button" type="button" data-choice-id="${escapeHtml(option.id)}" data-correct="${option.id === task.correct}">
            <span>${escapeHtml(option.label)}</span>
            <small>${escapeHtml(option.hint)}</small>
          </button>
        `).join("")}
      </div>
      <div class="account-choice-feedback" hidden role="status" aria-live="polite"></div>
    </article>
  `;
}

function initChoiceCards(container, section) {
  const tasksById = new Map(section.tasks.map((task) => [task.id, task]));
  const labelsById = new Map(section.choiceOptions.map((option) => [option.id, option.label]));

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
        feedback.textContent = `${correct ? "Richtig." : `Noch nicht. Richtige Lösung: ${labelsById.get(task.correct)}.`} ${task.explanation}`;
      });
    });
  });
}
