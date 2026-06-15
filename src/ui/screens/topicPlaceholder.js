import { gameRound } from "../../content/gameRound.js";
import { ROUTES, topicNrFromRoute } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

// Generischer Platzhalter für die noch nicht ausgearbeiteten Finanzthemen.
// Die Themen-Nummer steckt in der Route (spiel/thema/<nr>).
export function renderTopicPlaceholderScreen(route) {
  const nr = topicNrFromRoute(route);
  const topic = gameRound.financeTopics.topics.find((entry) => entry.nr === nr);

  if (!topic) {
    navigateTo(ROUTES.game);
    return;
  }

  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="topic-title">
      <div class="screen__content">
        <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
        <p class="eyebrow">${escapeHtml(gameRound.financeTopics.section)} · Thema ${escapeHtml(String(topic.nr))}</p>
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
