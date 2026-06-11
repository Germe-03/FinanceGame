import { renderMarkdown } from "../markdown.js";

export function initModuleModal() {
  const overlay = document.createElement("div");
  overlay.className = "module-modal-overlay";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="module-modal">
      <div class="module-modal-header">
        <h2 class="module-modal-title"></h2>
        <button type="button" class="module-modal-close" aria-label="Schliessen">✕</button>
      </div>
      <div class="module-modal-body"></div>
    </div>
  `;
  document.querySelector(".app-shell").appendChild(overlay);

  overlay.querySelector(".module-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  document.body.addEventListener("click", (e) => {
    const item = e.target.closest("[data-module]");
    if (item) openModule(item.dataset.module, item.querySelector(".lernmodule-name").textContent);
  });

  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const item = e.target.closest("[data-module]");
      if (item) {
        e.preventDefault();
        openModule(item.dataset.module, item.querySelector(".lernmodule-name").textContent);
      }
    }
  });

  function openModule(moduleId, title) {
    overlay.querySelector(".module-modal-title").textContent = title;
    overlay.querySelector(".module-modal-body").innerHTML = "<p>Wird geladen …</p>";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";

    fetch(`./lernmodule/${moduleId}.md`)
      .then((r) => r.text())
      .then((md) => { overlay.querySelector(".module-modal-body").innerHTML = renderMarkdown(md); })
      .catch(() => { overlay.querySelector(".module-modal-body").textContent = "Inhalt konnte nicht geladen werden."; });
  }
}
