import { gameRound } from "../../content/gameRound.js";
import { ROUTES, parseTopicRoute } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

// Detailscreen eines Finanzthemas (Route spiel/thema/<nr> bzw.
// spiel/thema/<nr>/<subNr>): listet die Unteraufgaben des Themas oder zeigt
// einen Platzhalter, solange noch kein Inhalt vorhanden ist.
export function renderTopicScreen(route) {
  const parsed = parseTopicRoute(route);
  const topic = parsed ? gameRound.financeTopics.topics.find((entry) => entry.nr === parsed.nr) : null;
  if (!topic) {
    navigateTo(ROUTES.game);
    return;
  }

  if (parsed.subNr != null) {
    renderSubtask(topic, parsed.subNr);
    return;
  }
  if (topic.subtasks.length > 0) {
    renderSubtaskList(topic);
    return;
  }
  renderPlaceholder(topic);
}

function renderSubtaskList(topic) {
  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="topic-title">
      <div class="screen__content screen__content--wide">
        <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
        <p class="eyebrow">${escapeHtml(gameRound.financeTopics.section)} · Thema ${escapeHtml(topic.nr)}</p>
        <h2 id="topic-title">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)}</h2>
        <p class="lead">Wähle eine Aufgabe zu diesem Thema.</p>
        <div class="toc-block">
          <h3 class="toc-section-bar toc-section-bar--finance">Aufgaben</h3>
          <ul class="toc-list">
            ${topic.subtasks.map((subtask) => `
              <li>
                <button class="toc-row" type="button" data-route="${escapeHtml(subtask.route)}">
                  <span class="toc-row__nr">${escapeHtml(subtask.nr)}</span>
                  <span class="toc-row__title">${escapeHtml(subtask.title)}</span>
                  <span class="toc-row__status">in Arbeit</span>
                </button>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-overview").addEventListener("click", () => navigateTo(ROUTES.game));
  appRoot.querySelectorAll("[data-route]").forEach((row) => {
    row.addEventListener("click", () => navigateTo(row.dataset.route));
  });
}

function renderSubtask(topic, subNr) {
  const subtask = topic.subtasks.find((entry) => entry.nr === subNr);
  if (!subtask) {
    navigateTo(topic.route);
    return;
  }

  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="subtask-title">
      <div class="screen__content">
        <button class="back-button" type="button" id="back-to-topic">Zurück zum Thema</button>
        <p class="eyebrow">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)} · Aufgabe ${escapeHtml(subtask.nr)}</p>
        <h2 id="subtask-title">${escapeHtml(subtask.title)}</h2>
        <p class="lead">Diese Aufgabe ist noch in Arbeit. Bald kannst Du hier «${escapeHtml(subtask.title)}» üben.</p>
        <div class="configuration-actions">
          <button class="primary-action" type="button" id="subtask-back-button">Zurück zum Thema</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-topic").addEventListener("click", () => navigateTo(topic.route));
  document.querySelector("#subtask-back-button").addEventListener("click", () => navigateTo(topic.route));
}

function renderPlaceholder(topic) {
  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="topic-title">
      <div class="screen__content">
        <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
        <p class="eyebrow">${escapeHtml(gameRound.financeTopics.section)} · Thema ${escapeHtml(topic.nr)}</p>
        <h2 id="topic-title">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)}</h2>
        <p class="lead">Diese Aufgabe ist noch in Arbeit. Bald kannst Du hier «${escapeHtml(topic.title)}» üben.</p>
        <div class="configuration-actions">
          <button class="primary-action" type="button" id="topic-back-button">Zurück zur Übersicht</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-overview").addEventListener("click", () => navigateTo(ROUTES.game));
  document.querySelector("#topic-back-button").addEventListener("click", () => navigateTo(ROUTES.game));
}
