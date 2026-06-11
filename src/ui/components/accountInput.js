import { filterAccounts } from "../../domain/booking.js";
import { escapeHtml } from "../dom.js";

export function initAccountInputs(container, accounts) {
  container.querySelectorAll(".account-field-wrapper").forEach((wrapper) => {
    const input = wrapper.querySelector(".account-input");
    const dropdown = wrapper.querySelector(".account-dropdown");

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (!q) {
        dropdown.hidden = true;
        return;
      }
      const filtered = filterAccounts(accounts, q);
      if (filtered.length === 0) {
        dropdown.hidden = true;
        return;
      }
      dropdown.innerHTML = filtered
        .map(({ number, name }) =>
          `<li role="option" data-account="${escapeHtml(name)}">${escapeHtml(number)} ${escapeHtml(name)}</li>`,
        )
        .join("");
      dropdown.hidden = false;
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && !dropdown.hidden) {
        const first = dropdown.querySelector("[data-account]");
        if (first) {
          input.value = first.dataset.account;
          dropdown.hidden = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => { dropdown.hidden = true; }, 150);
    });

    dropdown.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const li = event.target.closest("[data-account]");
      if (li) {
        input.value = li.dataset.account;
        dropdown.hidden = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });
}
