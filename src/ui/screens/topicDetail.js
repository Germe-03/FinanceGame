import { gameRound } from "../../content/gameRound.js";
import { ROUTES, parseTopicRoute } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";
import { setExpandedTopic } from "./topicsOverview.js";
import { subtaskScreens } from "./subtasks/registry.js";

// Dynamische Themen-Routen. Themen selbst werden in der Übersicht als Akkordeon
// aufgeklappt; nur einzelne Unteraufgaben (spiel/thema/<nr>/<subNr>) bekommen
// einen eigenen Platzhalter, solange sie noch keinen Inhalt haben.
export function renderTopicScreen(route) {
  const parsed = parseTopicRoute(route);
  const topic = parsed ? gameRound.financeTopics.topics.find((entry) => entry.nr === parsed.nr) : null;
  if (!topic) {
    navigateTo(ROUTES.game);
    return;
  }

  const subtask = parsed.subNr != null
    ? topic.subtasks.find((entry) => entry.nr === parsed.subNr)
    : null;

  // Themen-Route (oder unbekannte Unteraufgabe): Übersicht mit offenem Thema.
  if (!subtask) {
    setExpandedTopic(topic.nr);
    navigateTo(ROUTES.game);
    return;
  }

  // Rückkehr zur Übersicht soll das zugehörige Thema offen zeigen.
  setExpandedTopic(topic.nr);

  // Ausgearbeitete Unteraufgaben haben einen eigenen Screen (siehe registry.js).
  const renderSubtask = subtaskScreens[`${topic.nr}/${subtask.nr}`];
  if (renderSubtask) {
    renderSubtask(topic, subtask);
    return;
  }

  appRoot.innerHTML = `
    <section class="screen screen--overview" aria-labelledby="subtask-title">
      <div class="screen__content">
        <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
        <p class="eyebrow">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)} · Aufgabe ${escapeHtml(subtask.nr)}</p>
        <h2 id="subtask-title">${escapeHtml(subtask.title)}</h2>
        <p class="lead">Diese Aufgabe ist noch in Arbeit. Bald kannst Du hier «${escapeHtml(subtask.title)}» üben.</p>
        <div class="configuration-actions">
          <button class="primary-action" type="button" id="subtask-back-button">Zurück zur Übersicht</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-overview").addEventListener("click", () => navigateTo(ROUTES.game));
  document.querySelector("#subtask-back-button").addEventListener("click", () => navigateTo(ROUTES.game));
}
