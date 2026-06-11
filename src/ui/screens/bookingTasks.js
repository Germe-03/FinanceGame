import { accountPlan } from "../../content/accountPlan.js";
import { gameRound } from "../../content/gameRound.js";
import { getUniqueAccounts } from "../../domain/booking.js";
import { ROUTES } from "../../domain/navigation.js";
import { initAccountInputs } from "../components/accountInput.js";
import { renderLernmoduleSidebar } from "../components/sidebar.js";
import { renderGameSupportActions } from "../components/supportModal.js";
import { appRoot, escapeHtml } from "../dom.js";
import { loadProgress, saveAnswer } from "../progress.js";
import { navigateTo } from "../router.js";

export function renderBookingTaskScreen() {
  renderBookingTaskListScreen(gameRound.balanceOnlyTasks, {
    eyebrow: "Aufgabe 2 · Schritt 1 von 3",
    nextRoute: ROUTES.gameIncomeIntro,
    nextLabel: gameRound.balanceOnlyTasks.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.balanceOnlyTasks.tasks, accountPlan),
  });
}

export function renderMixedBookingTaskScreen() {
  renderBookingTaskListScreen(gameRound.mixedTasks, {
    eyebrow: "Aufgabe 2 · Schritt 3 von 3",
    nextRoute: ROUTES.gameInvoices,
    nextLabel: gameRound.mixedTasks.nextButtonLabel,
    accounts: getUniqueAccounts(gameRound.mixedTasks.tasks, accountPlan),
  });
}

export function renderInvoiceBookingScreen() {
  renderBookingTaskListScreen(gameRound.invoiceBooking, {
    eyebrow: "Aufgabe 3 · Rechnung kontieren",
    nextRoute: ROUTES.gameTKonto,
    nextLabel: "Weiter zu Aufgabe 4: T-Konto",
    accounts: getUniqueAccounts(gameRound.invoiceBooking.tasks, accountPlan),
  });
}

function renderBookingTaskListScreen(section, options) {
  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="game-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">${escapeHtml(options.eyebrow)}</p>
              <h2 id="game-title">${escapeHtml(section.title)}</h2>
              <p class="lead">${escapeHtml(section.lead)}</p>
              <p class="task-count">${section.tasks.length} Buchungssätze</p>
            </div>
            <div class="booking-task-list" aria-label="Buchungsaufgaben">
              ${section.tasks.map((task, i) => renderBookingTask(task, i)).join("")}
            </div>
            <div class="configuration-actions">
              ${options.nextRoute ? `<button class="primary-action" type="button" id="game-next-button">${escapeHtml(options.nextLabel)}</button>` : `<p class="status-line" role="status">${escapeHtml(options.status)}</p>`}
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  if (options.nextRoute) {
    document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(options.nextRoute));
  }

  const taskList = appRoot.querySelector(".booking-task-list");
  initAccountInputs(taskList, options.accounts ?? []);
  initSolutionToggles(taskList);
  initProgressPersistence(taskList);
}

function renderBookingTask(task, index) {
  if (task.noBooking) {
    return `
      <article class="booking-task-card" data-task-id="${escapeHtml(task.id)}">
        <div class="booking-task-card__head">
          <span class="task-number">${index + 1}</span>
          <p>${escapeHtml(task.scenario)}</p>
        </div>
        ${renderTaskImage(task)}
        ${renderBookingInputRow(0, false)}
        ${renderTaskCardFooter()}
        <div class="booking-task-solution" hidden aria-label="Musterlösung">
          <div class="solution-row">
            <span class="solution-booking">Keine Buchung — ${escapeHtml(task.noBookingReason)}</span>
          </div>
        </div>
      </article>
    `;
  }

  const isCompound = Boolean(task.bookings);
  const inputsHtml = isCompound
    ? task.bookings.map((_, i) => renderBookingInputRow(i, true)).join("")
    : renderBookingInputRow(0, false);
  const solutionHtml = (isCompound ? task.bookings : [task])
    .map(renderBookingSolutionRow)
    .join("");

  return `
    <article class="booking-task-card" data-task-id="${escapeHtml(task.id)}">
      <div class="booking-task-card__head">
        <span class="task-number">${index + 1}</span>
        <p>${escapeHtml(task.scenario)}</p>
      </div>
      ${renderTaskImage(task)}
      ${inputsHtml}
      ${renderTaskCardFooter()}
      <div class="booking-task-solution" hidden aria-label="Musterlösung">
        ${solutionHtml}
      </div>
    </article>
  `;
}

function renderTaskImage(task) {
  if (!task.image) return "";
  return `
    <figure class="invoice-task-image-frame">
      <img class="invoice-task-image" src="${escapeHtml(task.image.src)}" alt="${escapeHtml(task.image.alt)}">
      <figcaption>Rechnung pruefen und darunter den Buchungssatz eintragen.</figcaption>
    </figure>
  `;
}

function renderBookingInputRow(rowIndex, isCompound) {
  return `
    <div class="booking-task-inputs${rowIndex > 0 ? " booking-task-inputs--sub" : ""}">
      ${isCompound ? `<p class="booking-sub-label">Buchung ${rowIndex + 1}</p>` : ""}
      <label class="booking-input-group">
        <span class="booking-input-label">Soll</span>
        <div class="account-field-wrapper">
          <input type="text" class="account-input" data-role="debit"
            placeholder="Konto eingeben …" autocomplete="off" aria-label="Soll-Konto" aria-autocomplete="list">
          <ul class="account-dropdown" role="listbox" aria-label="Kontenvorschläge" hidden></ul>
        </div>
      </label>
      <label class="booking-input-group">
        <span class="booking-input-label">Haben</span>
        <div class="account-field-wrapper">
          <input type="text" class="account-input" data-role="credit"
            placeholder="Konto eingeben …" autocomplete="off" aria-label="Haben-Konto" aria-autocomplete="list">
          <ul class="account-dropdown" role="listbox" aria-label="Kontenvorschläge" hidden></ul>
        </div>
      </label>
      <label class="booking-input-group">
        <span class="booking-input-label">Betrag</span>
        <input type="text" class="amount-input"
          placeholder="CHF 0.00" autocomplete="off" aria-label="Betrag in CHF">
      </label>
    </div>
  `;
}

function renderTaskCardFooter() {
  return `
    <div class="task-card-footer">
      <button type="button" class="solution-toggle-button" aria-expanded="false">Lösung anzeigen</button>
      <button type="button" class="explanation-button" disabled aria-label="Erklärung folgt">Erklärung</button>
    </div>
  `;
}

function renderBookingSolutionRow(booking) {
  return `
    <div class="solution-row">
      <span class="solution-booking">${escapeHtml(accountLabel(booking.debit.account))} / ${escapeHtml(accountLabel(booking.credit.account))}</span>
      <span class="solution-amount">${escapeHtml(booking.amount)}</span>
    </div>
  `;
}

function accountLabel(name) {
  const entry = accountPlan.find((a) => a.name === name);
  return entry ? `${entry.number} ${name}` : name;
}

function initSolutionToggles(container) {
  container.querySelectorAll(".solution-toggle-button").forEach((button) => {
    button.addEventListener("click", () => {
      const solution = button.closest(".booking-task-card").querySelector(".booking-task-solution");
      const show = solution.hidden;
      solution.hidden = !show;
      button.textContent = show ? "Lösung verbergen" : "Lösung anzeigen";
      button.setAttribute("aria-expanded", String(show));
    });
  });
}

function initProgressPersistence(container) {
  const progress = loadProgress();

  container.querySelectorAll(".booking-task-card").forEach((card) => {
    const taskId = card.dataset.taskId;
    const saved = progress[taskId];

    if (saved) {
      const rows = card.querySelectorAll(".booking-task-inputs");
      const savedRows = saved.bookings ?? [saved];
      rows.forEach((row, i) => {
        if (!savedRows[i]) return;
        const b = savedRows[i];
        const debit = row.querySelector('[data-role="debit"]');
        const credit = row.querySelector('[data-role="credit"]');
        const amount = row.querySelector(".amount-input");
        if (debit) debit.value = b.debit ?? "";
        if (credit) credit.value = b.credit ?? "";
        if (amount) amount.value = b.amount ?? "";
      });
    }

    function persist() {
      const rows = [...card.querySelectorAll(".booking-task-inputs")];
      const entries = rows.map((row) => ({
        debit: row.querySelector('[data-role="debit"]')?.value ?? "",
        credit: row.querySelector('[data-role="credit"]')?.value ?? "",
        amount: row.querySelector(".amount-input")?.value ?? "",
      }));
      saveAnswer(taskId, rows.length > 1 ? { bookings: entries } : entries[0]);
    }

    card.querySelectorAll(".account-input").forEach((input) => input.addEventListener("change", persist));
    card.querySelectorAll(".amount-input").forEach((input) => input.addEventListener("blur", persist));
  });
}
