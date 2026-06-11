import { evaluateLedgerClosing, formatSwissAmount } from "../../domain/ledger.js";
import { ROUTES } from "../../domain/navigation.js";
import { renderLernmoduleSidebar } from "../components/sidebar.js";
import { renderGameSupportActions } from "../components/supportModal.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

const statesByAccount = new Map();

function getState(task) {
  if (!statesByAccount.has(task.accountNumber)) {
    statesByAccount.set(task.accountNumber, {
      placements: Object.fromEntries(task.items.map((item) => [item.id, null])),
      phase: "placing",
      closingInputs: { saldo: "", saldoSide: "haben", kontrollsumme: "" },
      closingResult: null,
    });
  }
  return statesByAccount.get(task.accountNumber);
}

function resetState(task) {
  statesByAccount.delete(task.accountNumber);
}

// Generischer T-Konto-Screen: task liefert accountName/-Nummer, lead, items
// (siehe gameRound.tKontoBank und gameRound.mwst.tKonto) sowie optional
// nextRoute/nextLabel für den Weiterführungs-Button in der Abschlussphase.
export function renderTKontoScreen(task, options = {}) {
  const eyebrow = options.eyebrow ?? "Aufgabe 4 · T-Konto";
  const rerender = () => renderTKontoScreen(task, options);
  const current = getState(task);
  const { placements, phase } = current;
  const items = task.items;

  const poolItems = items.filter((item) => placements[item.id] === null);
  const sollItems = items.filter((item) => placements[item.id] === "soll");
  const habenItems = items.filter((item) => placements[item.id] === "haben");
  const allPlaced = poolItems.length === 0;

  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="t-konto-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content screen__content--wide game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">${escapeHtml(eyebrow)}</p>
              <h2 id="t-konto-title">${escapeHtml(task.title)}</h2>
              <p class="lead">${escapeHtml(task.lead)}</p>
            </div>
            <div class="t-konto-workspace">
              ${phase === "placing" ? renderPool(poolItems, items.length) : ""}
              ${renderTable(sollItems, habenItems, task, current)}
              ${renderPhaseActions(allPlaced, phase)}
              ${phase === "closing" ? renderClosing(current, items, task) : ""}
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));

  if (phase === "placing") {
    initDragDrop(current, rerender);
    document.querySelectorAll("[data-t-reset]").forEach((btn) => {
      btn.addEventListener("click", () => { resetState(task); rerender(); });
    });
    if (allPlaced) {
      document.querySelector("#t-konto-next-btn").addEventListener("click", () => {
        current.phase = "closing";
        rerender();
      });
    }
  }

  if (phase === "closing") {
    const saldoInput = document.querySelector("#t-konto-saldo-input");
    const ksInput = document.querySelector("#t-konto-ks-input");
    saldoInput?.addEventListener("input", (e) => { current.closingInputs.saldo = e.target.value; });
    ksInput?.addEventListener("input", (e) => { current.closingInputs.kontrollsumme = e.target.value; });
    document.querySelectorAll("[name='saldo-side']").forEach((radio) => {
      if (radio.value === current.closingInputs.saldoSide) radio.checked = true;
      radio.addEventListener("change", (e) => { current.closingInputs.saldoSide = e.target.value; });
    });
    document.querySelector("#t-konto-back-btn")?.addEventListener("click", () => {
      current.phase = "placing";
      current.closingResult = null;
      rerender();
    });
    document.querySelector("#t-konto-reset-btn")?.addEventListener("click", () => {
      resetState(task);
      rerender();
    });
    document.querySelector("#t-konto-pruefen-btn")?.addEventListener("click", () => {
      current.closingInputs.saldo = saldoInput?.value ?? current.closingInputs.saldo;
      current.closingInputs.kontrollsumme = ksInput?.value ?? current.closingInputs.kontrollsumme;
      current.closingResult = evaluateLedgerClosing(items, current.placements, current.closingInputs);
      rerender();
    });
    document.querySelector("#t-konto-continue-btn")?.addEventListener("click", () => navigateTo(task.nextRoute));
  }
}

function renderPool(poolItems, totalCount) {
  const placedCount = totalCount - poolItems.length;
  const chipsHtml = poolItems.length === 0
    ? `<p class="t-konto-pool-empty">Alle ${totalCount} Buchungssätze sind zugeordnet.</p>`
    : poolItems.map((item) => `
        <div class="t-konto-chip" draggable="true" data-t-chip="${escapeHtml(item.id)}"
          title="${escapeHtml(item.scenario)}">
          <span class="t-konto-chip__id">${escapeHtml(item.taskId)}</span>
          <span class="t-konto-chip__amount">${escapeHtml(item.amount)}</span>
          <p class="t-konto-chip__scenario">${escapeHtml(item.scenario)}</p>
        </div>
      `).join("");

  return `
    <div class="t-konto-pool-section">
      <div class="t-konto-pool-header">
        <span class="t-konto-pool-label">Buchungssätze mit Konto Bank</span>
        <span class="t-konto-progress">${placedCount} von ${totalCount} zugeordnet</span>
      </div>
      <div class="t-konto-pool" data-t-drop="pool">
        ${chipsHtml}
      </div>
    </div>
  `;
}

function renderTable(sollItems, habenItems, task, current) {
  const { closingResult, phase } = current;
  const isPlacing = phase === "placing";

  const renderEntry = (item) => {
    const isCorrect = closingResult != null ? item.side === current.placements[item.id] : null;
    const statusClass = isCorrect != null ? (isCorrect ? " t-konto-entry--correct" : " t-konto-entry--wrong") : "";
    const checkIcon = isCorrect != null ? `<span class="t-konto-entry__check">${isCorrect ? "✓" : "✗"}</span>` : "";
    const draggableAttr = isPlacing ? `draggable="true" data-t-chip="${escapeHtml(item.id)}"` : "";
    return `
      <div class="t-konto-entry${statusClass}" ${draggableAttr} title="${escapeHtml(item.scenario)}">
        <span class="t-konto-entry__id">${escapeHtml(item.taskId)}</span>
        <span class="t-konto-entry__counter">${escapeHtml(item.counterAccount)}</span>
        <span class="t-konto-entry__amount">${escapeHtml(item.amount)}</span>
        ${checkIcon}
      </div>
    `;
  };

  let sollSaldoRow = "";
  let habenSaldoRow = "";
  let ksFooter = "";
  if (closingResult) {
    const { correctSaldoSide, correctSaldo, correctKS } = closingResult;
    const saldoDisplay = formatSwissAmount(correctSaldo);
    const ksDisplay = formatSwissAmount(correctKS);
    if (correctSaldoSide === "haben") {
      habenSaldoRow = `<div class="t-konto-saldo-row"><span>Saldo</span><span>${saldoDisplay}</span></div>`;
    } else {
      sollSaldoRow = `<div class="t-konto-saldo-row"><span>Saldo</span><span>${saldoDisplay}</span></div>`;
    }
    ksFooter = `
      <div class="t-konto-ks-row">
        <div class="t-konto-ks-cell t-konto-ks-cell--soll">${ksDisplay}</div>
        <div class="t-konto-ks-cell t-konto-ks-cell--haben">${ksDisplay}</div>
      </div>
    `;
  }

  const dropAttr = (side) => isPlacing ? `data-t-drop="${side}"` : "";
  const dropHint = (label) => isPlacing
    ? `<div class="t-konto-dropzone">${escapeHtml(label)}</div>`
    : "";

  return `
    <div class="t-konto">
      <div class="t-konto-name">
        ${escapeHtml(task.accountName)}
        <span class="t-konto-number">${escapeHtml(task.accountNumber)}</span>
      </div>
      <div class="t-konto-columns">
        <div class="t-konto-col t-konto-col--soll" ${dropAttr("soll")}>
          <div class="t-konto-col-header">Soll</div>
          <div class="t-konto-col-entries">
            ${sollItems.map(renderEntry).join("") || '<p class="t-konto-col-empty">Noch kein Eintrag</p>'}
            ${sollSaldoRow}
          </div>
          ${dropHint("Soll-Buchung hierher ziehen")}
        </div>
        <div class="t-konto-col t-konto-col--haben" ${dropAttr("haben")}>
          <div class="t-konto-col-header">Haben</div>
          <div class="t-konto-col-entries">
            ${habenItems.map(renderEntry).join("") || '<p class="t-konto-col-empty">Noch kein Eintrag</p>'}
            ${habenSaldoRow}
          </div>
          ${dropHint("Haben-Buchung hierher ziehen")}
        </div>
      </div>
      ${ksFooter}
    </div>
  `;
}

function renderPhaseActions(allPlaced, phase) {
  if (phase === "closing") return "";
  if (!allPlaced) {
    return `
      <div class="t-konto-hint-row">
        <p class="t-konto-hint" role="status">Ordne alle Buchungssätze in das T-Konto ein, um fortzufahren.</p>
        <button class="secondary-action t-konto-reset-sm" type="button" data-t-reset>Zurücksetzen</button>
      </div>
    `;
  }
  return `
    <div class="configuration-actions">
      <button class="secondary-action" type="button" data-t-reset>Zurücksetzen</button>
      <button class="primary-action" type="button" id="t-konto-next-btn">Konto abschliessen →</button>
    </div>
  `;
}

function renderClosing(current, items, task) {
  const { closingInputs, closingResult } = current;
  const saldoSideHaben = (closingInputs.saldoSide || "haben") === "haben";

  let feedbackHtml = "";
  if (closingResult) {
    const { correctSaldo, correctSaldoSide, correctKS, userSaldoOk, userSaldoSideOk, userKsOk, placementScore } = closingResult;
    const closingOk = userSaldoOk && userSaldoSideOk && userKsOk;
    const allOk = closingOk && placementScore === items.length;
    feedbackHtml = `
      <div class="t-konto-closing-feedback ${closingOk ? "t-konto-closing-feedback--success" : "t-konto-closing-feedback--partial"}">
        <p><strong>Zuordnung:</strong> ${placementScore} von ${items.length} Buchungssätze korrekt.</p>
        <p><strong>Saldo:</strong> ${userSaldoOk && userSaldoSideOk
          ? "✓ Richtig."
          : `✗ Korrekt: CHF ${formatSwissAmount(correctSaldo)} auf ${correctSaldoSide === "soll" ? "Soll" : "Haben"}.`}
        </p>
        <p><strong>Kontrollsumme:</strong> ${userKsOk
          ? "✓ Richtig."
          : `✗ Korrekt: CHF ${formatSwissAmount(correctKS)}.`}
        </p>
        ${allOk ? "<p><strong>Ausgezeichnet!</strong> Das T-Konto Bank ist vollständig und korrekt abgeschlossen.</p>" : ""}
        ${closingOk && placementScore < items.length ? "<p>Die Abschluss-Werte stimmen. Korrigiere noch die falsch zugeordneten Buchungssätze.</p>" : ""}
      </div>
    `;
  }

  return `
    <div class="t-konto-closing">
      <h3>Konto abschliessen</h3>
      <p class="t-konto-closing-lead">Berechne den Saldo und die Kontrollsumme. Der Saldo geht auf die Seite mit dem kleineren Gesamtbetrag, damit beide Seiten gleich sind.</p>
      <div class="t-konto-closing-form">
        <div class="t-konto-closing-row">
          <label class="t-konto-closing-label" for="t-konto-saldo-input">Saldo</label>
          <div class="t-konto-closing-inputs">
            <div class="t-konto-closing-input-group">
              <span class="t-konto-closing-currency">CHF</span>
              <input class="t-konto-closing-input" id="t-konto-saldo-input" type="text"
                placeholder="0.00" inputmode="decimal" autocomplete="off"
                value="${escapeHtml(closingInputs.saldo)}">
            </div>
            <fieldset class="t-konto-closing-side-choice">
              <legend class="sr-only">Auf welche Seite gehört der Saldo?</legend>
              <label class="t-konto-closing-radio">
                <input type="radio" name="saldo-side" value="soll"${!saldoSideHaben ? " checked" : ""}> Soll
              </label>
              <label class="t-konto-closing-radio">
                <input type="radio" name="saldo-side" value="haben"${saldoSideHaben ? " checked" : ""}> Haben
              </label>
            </fieldset>
          </div>
        </div>
        <div class="t-konto-closing-row">
          <label class="t-konto-closing-label" for="t-konto-ks-input">Kontrollsumme</label>
          <div class="t-konto-closing-input-group">
            <span class="t-konto-closing-currency">CHF</span>
            <input class="t-konto-closing-input" id="t-konto-ks-input" type="text"
              placeholder="0.00" inputmode="decimal" autocomplete="off"
              value="${escapeHtml(closingInputs.kontrollsumme)}">
          </div>
        </div>
        <div class="t-konto-closing-actions">
          <button class="secondary-action" type="button" id="t-konto-back-btn">← Zuordnung korrigieren</button>
          <button class="secondary-action" type="button" id="t-konto-reset-btn">Neustart</button>
          <button class="primary-action" type="button" id="t-konto-pruefen-btn">Prüfen</button>
          ${task.nextRoute ? `<button class="primary-action" type="button" id="t-konto-continue-btn">${escapeHtml(task.nextLabel)}</button>` : ""}
        </div>
      </div>
      ${feedbackHtml}
    </div>
  `;
}

function initDragDrop(current, rerender) {
  document.querySelectorAll("[data-t-chip]").forEach((chip) => {
    chip.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", chip.dataset.tChip);
      e.dataTransfer.effectAllowed = "move";
    });
  });

  document.querySelectorAll("[data-t-drop]").forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      zone.classList.add("t-konto-drop--active");
    });
    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove("t-konto-drop--active");
      }
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("t-konto-drop--active");
      const itemId = e.dataTransfer.getData("text/plain");
      if (!itemId) return;
      current.placements[itemId] = zone.dataset.tDrop === "pool" ? null : zone.dataset.tDrop;
      rerender();
    });
  });
}
