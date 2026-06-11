import { theoryModules } from "../../content/theoryModules.js";
import { searchLearningModules } from "../../domain/learningModules.js";
import { ROUTES, routeFromHash } from "../../domain/navigation.js";
import { escapeHtml } from "../dom.js";

let learningModuleSearchQuery = "";
let learningModuleSearchRequestId = 0;
let learningModuleDocumentsPromise = null;

const taskItems = Object.freeze([
  { number: "1", name: "Kontenplan", routes: [ROUTES.game, ROUTES.gameAccountPlan] },
  { number: "2", name: "Buchungssätze", routes: [ROUTES.gameBalance, ROUTES.gameIncomeIntro, ROUTES.gameMixed] },
  { number: "3", name: "Rechnungen", routes: [ROUTES.gameInvoices] },
  { number: "4", name: "T-Konto Bank", routes: [ROUTES.gameTKonto] },
]);

export function renderLernmoduleSidebar() {
  const currentRoute = routeFromHash(window.location.hash);
  const theoryItems = renderTheoryModuleItems(theoryModules);
  const gameItems = taskItems
    .map((item) => {
      const current = item.routes.includes(currentRoute);
      return `
        <li class="lernmodule-item ${current ? "lernmodule-item--current" : ""}"${current ? ' aria-current="step"' : ""}>
          <span class="lernmodule-number">${escapeHtml(item.number)}</span>
          <span class="lernmodule-name">${escapeHtml(item.name)}</span>
        </li>`;
    })
    .join("");

  return `
    <aside class="lernmodule-sidebar" aria-label="Lernmodule">
      <p class="lernmodule-title">Lernmodule</p>
      <label class="lernmodule-search-label" for="lernmodule-search">Suche in Lernmodulen</label>
      <input class="lernmodule-search-input" id="lernmodule-search" type="search" data-learning-module-search autocomplete="off" placeholder="Keyword suchen" value="${escapeHtml(learningModuleSearchQuery)}">
      <p class="lernmodule-search-status" role="status" aria-live="polite">${learningModuleSearchQuery.trim() ? "Suche laeuft ..." : `${theoryModules.length} Lernmodule`}</p>
      <p class="lernmodule-section-label">Theorie</p>
      <ul class="lernmodule-list" data-learning-module-results>${theoryItems}</ul>
      <p class="lernmodule-section-label">Aufgaben</p>
      <ul class="lernmodule-list">${gameItems}</ul>
    </aside>
  `;
}

export function initLearningModuleSearch() {
  document.body.addEventListener("input", (event) => {
    const input = event.target.closest("[data-learning-module-search]");
    if (!input) return;
    learningModuleSearchQuery = input.value;
    updateLearningModuleSearch(input.closest(".lernmodule-sidebar"), learningModuleSearchQuery);
  });
}

function renderTheoryModuleItems(modules) {
  return modules.map(renderTheoryModuleItem).join("");
}

function renderTheoryModuleItem(module) {
  return `
    <li class="lernmodule-item lernmodule-item--theory" data-module="${escapeHtml(module.id)}" tabindex="0" role="button" aria-label="${escapeHtml(module.name)} oeffnen">
      <span class="lernmodule-icon">T</span>
      <span class="lernmodule-name">${escapeHtml(module.name)}</span>
    </li>`;
}

function renderLearningModuleEmptyState(query) {
  return `<li class="lernmodule-empty">Kein Lernmodul enthaelt "${escapeHtml(query)}".</li>`;
}

function loadLearningModuleDocuments() {
  if (!learningModuleDocumentsPromise) {
    learningModuleDocumentsPromise = Promise.all(
      theoryModules.map(async (module) => {
        const response = await fetch(`./lernmodule/${module.id}.md`);
        if (!response.ok) throw new Error(`Lernmodul konnte nicht geladen werden: ${module.id}`);
        return Object.freeze({ ...module, markdown: await response.text() });
      }),
    );
  }
  return learningModuleDocumentsPromise;
}

async function updateLearningModuleSearch(sidebar, query) {
  if (!sidebar) return;
  const resultsList = sidebar.querySelector("[data-learning-module-results]");
  const status = sidebar.querySelector(".lernmodule-search-status");
  if (!resultsList || !status) return;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    resultsList.innerHTML = renderTheoryModuleItems(theoryModules);
    status.textContent = `${theoryModules.length} Lernmodule`;
    return;
  }

  const requestId = ++learningModuleSearchRequestId;
  status.textContent = "Suche laeuft ...";

  try {
    const documents = await loadLearningModuleDocuments();
    if (requestId !== learningModuleSearchRequestId) return;
    const results = searchLearningModules(documents, trimmedQuery);
    resultsList.innerHTML = results.length > 0 ? renderTheoryModuleItems(results) : renderLearningModuleEmptyState(trimmedQuery);
    status.textContent = results.length === 1 ? "1 Treffer" : `${results.length} Treffer`;
  } catch {
    if (requestId !== learningModuleSearchRequestId) return;
    resultsList.innerHTML = renderTheoryModuleItems(theoryModules);
    status.textContent = "Suche konnte nicht geladen werden.";
  }
}
