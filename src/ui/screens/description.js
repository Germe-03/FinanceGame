import { gameDescription } from "../../content/gameDescription.js";
import { ROUTES } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

export function renderDescriptionScreen() {
  appRoot.innerHTML = `
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
