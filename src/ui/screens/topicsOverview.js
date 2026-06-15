import { gameRound } from "../../content/gameRound.js";
import { ROUTES } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

// Welches Finanzthema im Akkordeon offen ist. Überdauert Re-Renders und die
// Rückkehr von einer Unteraufgabe; null = alle geschlossen.
let expandedNr = null;

export function setExpandedTopic(nr) {
  expandedNr = nr;
}

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
            ${legacyTasks.tasks.map((task) => renderLinkRow(task.nr, task.title, task.route, "Üben")).join("")}
          </ul>
        </div>

        <div class="toc-block">
          <h3 class="toc-section-bar toc-section-bar--finance">${escapeHtml(financeTopics.section)}</h3>
          <ul class="toc-list" data-accordion>
            ${financeTopics.topics.map(renderAccordionItem).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));

  const accordion = appRoot.querySelector("[data-accordion]");
  accordion.addEventListener("click", (event) => {
    const trigger = event.target.closest(".toc-acc-trigger");
    if (trigger) {
      toggleItem(accordion, trigger.closest(".toc-acc-item"));
      return;
    }
    const link = event.target.closest("[data-route]");
    if (link) navigateTo(link.dataset.route);
  });

  // «Alte Aufgaben» sind direkte Links in die bestehenden Aufgaben.
  appRoot.querySelectorAll(".toc-list:not([data-accordion]) [data-route]").forEach((row) => {
    row.addEventListener("click", () => navigateTo(row.dataset.route));
  });
}

function toggleItem(accordion, item) {
  const willOpen = !item.classList.contains("toc-acc-item--open");
  accordion.querySelectorAll(".toc-acc-item--open").forEach((open) => setItemOpen(open, false));
  setItemOpen(item, willOpen);
  expandedNr = willOpen ? Number(item.dataset.nr) : null;
}

function setItemOpen(item, open) {
  item.classList.toggle("toc-acc-item--open", open);
  item.querySelector(".toc-acc-trigger").setAttribute("aria-expanded", String(open));
  const panel = item.querySelector(".toc-acc-panel");
  if (open) {
    panel.removeAttribute("hidden");
  } else {
    panel.setAttribute("hidden", "");
  }
}

function renderAccordionItem(topic) {
  const open = topic.nr === expandedNr;
  const status = topic.subtasks.length > 0 ? `${topic.subtasks.length} Aufgaben` : "in Arbeit";
  const panelId = `topic-panel-${topic.nr}`;
  return `
    <li class="toc-acc-item${open ? " toc-acc-item--open" : ""}" data-nr="${escapeHtml(topic.nr)}">
      <button class="toc-row toc-acc-trigger" type="button" aria-expanded="${open}" aria-controls="${panelId}">
        <span class="toc-row__nr">${escapeHtml(topic.nr)}</span>
        <span class="toc-row__title">${escapeHtml(topic.title)}</span>
        <span class="toc-row__end">
          <span class="toc-row__status">${escapeHtml(status)}</span>
          <span class="toc-row__chev" aria-hidden="true">▾</span>
        </span>
      </button>
      <div class="toc-acc-panel" id="${panelId}" role="region"${open ? "" : " hidden"}>
        ${renderPanelBody(topic)}
      </div>
    </li>
  `;
}

function renderPanelBody(topic) {
  if (topic.subtasks.length === 0) {
    return `<p class="toc-acc-empty">Diese Aufgabe ist noch in Arbeit.</p>`;
  }
  return `
    <ul class="toc-sublist">
      ${topic.subtasks.map((subtask) => `
        <li>
          <button class="toc-subrow" type="button" data-route="${escapeHtml(subtask.route)}">
            <span class="toc-subrow__nr">${escapeHtml(topic.nr)}.${escapeHtml(subtask.nr)}</span>
            <span class="toc-subrow__title">${escapeHtml(subtask.title)}</span>
            <span class="toc-row__status">in Arbeit</span>
          </button>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderLinkRow(nr, title, route, status) {
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
