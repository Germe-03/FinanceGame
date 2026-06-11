import { caseBriefing } from "../../content/caseBriefing.js";
import { ROUTES } from "../../domain/navigation.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

export function renderCaseScreen() {
  appRoot.innerHTML = `
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
