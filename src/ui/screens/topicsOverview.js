import { gameRound } from "../../content/gameRound.js";
import { ROUTES } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

// Inhaltsübersicht: bündelt die bisherigen Aufgaben unter «Alte Aufgaben» und
// listet darunter die finanzwirtschaftlichen Themen aus dem Lehrmittel.
export function renderTopicsOverviewScreen() {
  const { financeTopics, legacyTasks } = gameRound;

  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="overview-title">
      <div class="screen__content screen__content--wide">
        <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
        <p class="eyebrow">Inhaltsübersicht</p>
        <h2 id="overview-title">${escapeHtml(financeTopics.title)}</h2>
        <p class="lead">${escapeHtml(financeTopics.lead)}</p>

        <div class="toc-block">
          <h3 class="toc-section-bar toc-section-bar--legacy">${escapeHtml(legacyTasks.title)}</h3>
          <ul class="toc-list">
            ${legacyTasks.tasks.map((task) => renderRow(task.nr, task.title, task.route, "Üben")).join("")}
          </ul>
        </div>

        <div class="toc-block">
          <h3 class="toc-section-bar toc-section-bar--finance">${escapeHtml(financeTopics.section)}</h3>
          <ul class="toc-list">
            ${financeTopics.topics.map((topic) => renderRow(topic.nr, topic.title, topic.route, "in Arbeit")).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));

  appRoot.querySelectorAll("[data-route]").forEach((row) => {
    row.addEventListener("click", () => navigateTo(row.dataset.route));
  });
}

function renderRow(nr, title, route, status) {
  return `
    <li>
      <button class="toc-row" type="button" data-route="${escapeHtml(route)}">
        <span class="toc-row__nr">${escapeHtml(String(nr))}</span>
        <span class="toc-row__title">${escapeHtml(title)}</span>
        <span class="toc-row__status">${escapeHtml(status)}</span>
      </button>
    </li>
  `;
}
