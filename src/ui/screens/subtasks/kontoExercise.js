import konto from "../../../content/tasks/konto.json" with { type: "json" };
import { evaluateTermPlacement } from "../../../domain/termPlacement.js";
import { ROUTES } from "../../../domain/navigation.js";
import { appRoot, escapeHtml } from "../../dom.js";
import { navigateTo } from "../../router.js";

const POSITIONS = ["headerLeft", "headerRight", "valueLeft", "valueRight"];

// Aufgabe 1.1 «Konto»: Begriffe (Soll/Haben/+/−) auf die richtige Seite eines
// Aktiv- und eines Passivkontos ziehen, danach «Korrigieren».
export function renderKontoExerciseScreen(topic, subtask) {
  const slots = buildSlots();
  const state = {
    placements: Object.fromEntries(slots.map((slot) => [slot.id, null])),
    pools: Object.fromEntries(konto.accounts.map((account) => [account.key, shuffle(poolTerms(account))])),
    checked: false,
  };

  paint();

  function paint() {
    const evaluation = state.checked ? evaluateTermPlacement(slots, state.placements) : null;
    const okById = evaluation
      ? Object.fromEntries(evaluation.results.map((result) => [result.id, result.ok]))
      : {};

    appRoot.innerHTML = `
      <section class="screen screen--game" aria-labelledby="konto-ex-title">
        <div class="screen__content screen__content--wide">
          <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
          <p class="eyebrow">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)} · Aufgabe ${escapeHtml(subtask.nr)}</p>
          <h2 id="konto-ex-title">${escapeHtml(subtask.title)}</h2>
          <p class="lead">${escapeHtml(konto.lead)}</p>
          <div class="konto-ex-workspace" data-konto-ex>
            ${konto.accounts.map((account) => renderAccountRow(account, state, okById)).join("")}
            <div class="konto-ex-actions">
              <button class="secondary-action" type="button" id="konto-ex-reset">Zurücksetzen</button>
              <button class="primary-action" type="button" id="konto-ex-check">Korrigieren</button>
            </div>
            ${evaluation ? renderFeedback(evaluation) : ""}
          </div>
        </div>
      </section>
    `;

    wire();
  }

  function wire() {
    document.querySelector("#back-to-overview").addEventListener("click", () => navigateTo(ROUTES.game));
    document.querySelector("#konto-ex-check").addEventListener("click", () => {
      state.checked = true;
      paint();
    });
    document.querySelector("#konto-ex-reset").addEventListener("click", () => {
      for (const id of Object.keys(state.placements)) state.placements[id] = null;
      state.checked = false;
      paint();
    });

    const workspace = appRoot.querySelector("[data-konto-ex]");
    let activeZone = null;

    workspace.addEventListener("dragstart", (event) => {
      const chip = event.target.closest(".konto-ex-chip");
      if (!chip) return;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", JSON.stringify({
        term: chip.dataset.term,
        from: chip.dataset.from,
        account: chip.dataset.account,
      }));
    });

    workspace.addEventListener("dragover", (event) => {
      const zone = event.target.closest("[data-drop]");
      if (!zone) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (activeZone !== zone) {
        activeZone?.classList.remove("konto-ex-drop--active");
        zone.classList.add("konto-ex-drop--active");
        activeZone = zone;
      }
    });

    workspace.addEventListener("dragleave", (event) => {
      const zone = event.target.closest("[data-drop]");
      if (zone && !zone.contains(event.relatedTarget)) {
        zone.classList.remove("konto-ex-drop--active");
        if (activeZone === zone) activeZone = null;
      }
    });

    workspace.addEventListener("drop", (event) => {
      const zone = event.target.closest("[data-drop]");
      if (!zone) return;
      event.preventDefault();
      activeZone?.classList.remove("konto-ex-drop--active");
      activeZone = null;

      let payload;
      try {
        payload = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch {
        return;
      }
      if (!payload || zone.dataset.account !== payload.account) return; // nur innerhalb derselben Kontoart

      if (payload.from && payload.from !== `pool:${payload.account}`) {
        state.placements[payload.from] = null;
      }
      if (zone.dataset.slot) {
        state.placements[zone.dataset.slot] = payload.term;
      }
      paint();
    });
  }
}

function buildSlots() {
  return konto.accounts.flatMap((account) =>
    POSITIONS.map((position) => ({
      id: `${account.key}-${position}`,
      correct: account.slots[position],
    })),
  );
}

function poolTerms(account) {
  return POSITIONS.map((position) => account.slots[position]);
}

function placedTerms(account, state) {
  return POSITIONS
    .map((position) => state.placements[`${account.key}-${position}`])
    .filter((term) => term !== null);
}

function renderAccountRow(account, state, okById) {
  const placed = placedTerms(account, state);
  const remaining = state.pools[account.key].filter((term) => !placed.includes(term));
  const key = account.key;

  return `
    <div class="konto-ex-row">
      <div class="konto-ex-tkonto">
        <div class="konto-ex-tkonto-title">${escapeHtml(account.type)}<small>${escapeHtml(account.hint)}</small></div>
        <div class="konto-ex-tkonto-cols">
          <div class="konto-ex-col konto-ex-col--left">
            ${renderSlot(`${key}-headerLeft`, account, state, okById, "head", "Soll / Haben")}
            ${renderSlot(`${key}-valueLeft`, account, state, okById, "sign-left", "+ / −")}
          </div>
          <div class="konto-ex-col konto-ex-col--right">
            ${renderSlot(`${key}-headerRight`, account, state, okById, "head", "Soll / Haben")}
            ${renderSlot(`${key}-valueRight`, account, state, okById, "sign-right", "+ / −")}
          </div>
        </div>
      </div>
      <div class="konto-ex-pool" data-drop data-pool="${escapeHtml(key)}" data-account="${escapeHtml(key)}">
        <span class="konto-ex-pool-label">Begriffe</span>
        ${remaining.map((term) => renderChip(term, `pool:${key}`, key)).join("")
          || '<span class="konto-ex-pool-empty">leer</span>'}
      </div>
    </div>
  `;
}

function renderSlot(slotId, account, state, okById, variant, placeholder) {
  const term = state.placements[slotId];
  const classes = ["konto-ex-slot", `konto-ex-slot--${variant}`];

  let content;
  if (term !== null) {
    let chipExtra = "";
    if (state.checked) chipExtra = okById[slotId] ? " konto-ex-chip--correct" : " konto-ex-chip--wrong";
    content = renderChip(term, slotId, account.key, chipExtra);
  } else {
    if (state.checked) classes.push("konto-ex-slot--missing");
    content = `<span class="konto-ex-placeholder">${escapeHtml(placeholder)}</span>`;
  }

  return `
    <div class="${classes.join(" ")}" data-drop data-slot="${slotId}" data-account="${escapeHtml(account.key)}">
      ${content}
    </div>
  `;
}

function renderChip(term, from, accountKey, extraClass = "") {
  return `
    <div class="konto-ex-chip${extraClass}" draggable="true"
      data-term="${escapeHtml(term)}" data-from="${escapeHtml(from)}" data-account="${escapeHtml(accountKey)}">
      ${escapeHtml(term)}
    </div>
  `;
}

function renderFeedback(evaluation) {
  const variant = evaluation.allCorrect ? "success" : "partial";
  const message = evaluation.allCorrect
    ? "Alles richtig! Beim Aktivkonto steht die Zunahme im Soll, beim Passivkonto im Haben."
    : `${evaluation.correctCount} von ${evaluation.total} richtig platziert. Korrigiere die rot markierten Felder.`;
  return `<p class="konto-ex-feedback konto-ex-feedback--${variant}" role="status">${escapeHtml(message)}</p>`;
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
