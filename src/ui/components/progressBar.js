import { summarizeProgress } from "../../domain/taskProgress.js";
import { escapeHtml } from "../dom.js";

export function renderProgressBar(done, total, suffix) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return `
    <div class="progress-bar" data-progress-bar data-progress-suffix="${escapeHtml(suffix)}"
      role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
      <div class="progress-bar__track"><div class="progress-bar__fill" style="width: ${percent}%"></div></div>
      <span class="progress-bar__label">${done} von ${total} ${escapeHtml(suffix)}</span>
    </div>
  `;
}

export function updateProgressBar(root, completedFlags) {
  const bar = root.querySelector("[data-progress-bar]");
  if (!bar) return;
  const { done, total, percent } = summarizeProgress(completedFlags);
  bar.setAttribute("aria-valuemax", String(total));
  bar.setAttribute("aria-valuenow", String(done));
  bar.querySelector(".progress-bar__fill").style.width = `${percent}%`;
  bar.querySelector(".progress-bar__label").textContent = `${done} von ${total} ${bar.dataset.progressSuffix}`;
}
