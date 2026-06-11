import { gameRound } from "../../content/gameRound.js";
import { escapeHtml } from "../dom.js";
import { initCalculator, renderCalculatorPopup } from "./calculator.js";

export function renderGameSupportActions() {
  return `
    <nav class="game-reference-bar" aria-label="Nachschlagewerke und Werkzeuge">
      ${gameRound.referenceActions.map(renderReferenceAction).join("")}
      ${renderCalculatorAction()}
    </nav>
    <div class="game-buddy-bar">
      <button class="buddy-button" type="button" disabled title="${escapeHtml(gameRound.buddyAction.hint)}">${escapeHtml(gameRound.buddyAction.label)}</button>
    </div>
  `;
}

function renderReferenceAction(action) {
  return `<button class="support-popup-button" type="button" data-support-popup="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`;
}

function renderCalculatorAction() {
  return `<button class="support-popup-button" type="button" data-support-popup="calculator">Taschenrechner</button>`;
}

function renderResourcePopup(action) {
  return `
    <div class="support-resource-view">
      <iframe class="support-resource-frame" src="${escapeHtml(action.href)}" title="${escapeHtml(action.label)}"></iframe>
      <a class="support-resource-link" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer">Dokument in neuem Tab oeffnen</a>
    </div>
  `;
}

export function initSupportModal() {
  const overlay = document.createElement("div");
  overlay.className = "support-modal-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "support-modal-title");
  overlay.innerHTML = `
    <div class="support-modal">
      <div class="support-modal-header">
        <h2 class="support-modal-title" id="support-modal-title"></h2>
        <button type="button" class="support-modal-close" aria-label="Schliessen">x</button>
      </div>
      <div class="support-modal-body"></div>
    </div>
  `;
  document.querySelector(".app-shell").appendChild(overlay);

  const title = overlay.querySelector(".support-modal-title");
  const body = overlay.querySelector(".support-modal-body");
  const closeButton = overlay.querySelector(".support-modal-close");
  let previousFocus = null;

  closeButton.addEventListener("click", closeSupportModal);
  overlay.addEventListener("click", (event) => {
    const resourceLink = event.target.closest(".support-resource-link");
    if (resourceLink) {
      const resourceUrl = new URL(resourceLink.href, window.location.href).href;
      const opened = window.open(resourceUrl, "_blank");
      if (opened) {
        event.preventDefault();
        opened.opener = null;
      }
      return;
    }
    if (event.target === overlay) closeSupportModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSupportModal();
  });
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-support-popup]");
    if (!button) return;
    openSupportPopup(button.dataset.supportPopup);
  });

  function openSupportPopup(id) {
    previousFocus = document.activeElement;
    if (id === "calculator") {
      title.textContent = "Taschenrechner";
      body.innerHTML = renderCalculatorPopup();
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      initCalculator(overlay);
      overlay.querySelector(".calculator-display").focus();
      return;
    }

    const action = gameRound.referenceActions.find((referenceAction) => referenceAction.id === id);
    if (!action) return;
    title.textContent = action.label;
    body.innerHTML = renderResourcePopup(action);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closeSupportModal() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    body.innerHTML = "";
    document.body.style.overflow = "";
    if (previousFocus?.focus) previousFocus.focus();
  }
}
