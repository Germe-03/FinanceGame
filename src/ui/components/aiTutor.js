export const TUTOR_API_BASE = "http://127.0.0.1:8766";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Ich helfe dir bei dieser Aufgabe. Frag zum Beispiel nach Soll, Haben, Kontoart oder dem naechsten sinnvollen Schritt.",
};

export function sanitizeTutorMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-14);
}

export function buildTutorPayload({ messages, routeHash, screenTitle, screenText } = {}) {
  const gameContext = {
    app: "FinanceGame",
    route_hash: routeHash ?? getRouteHash(),
    screen_title: screenTitle ?? getScreenTitle(),
  };
  const currentScreenText = normalizeScreenText(screenText ?? getScreenText());
  if (currentScreenText) {
    gameContext.screen_text = currentScreenText;
  }

  return {
    messages: sanitizeTutorMessages(messages),
    game_context: gameContext,
  };
}

export function normalizeTutorAnswer(payload) {
  if (payload?.error) {
    throw new Error(payload.error);
  }

  const answer = typeof payload?.answer === "string" ? payload.answer.trim() : "";
  if (!answer) {
    throw new Error("Der Tutor hat keine Antwort geliefert.");
  }
  return answer;
}

// Lässt eine Begründung serverseitig (Ollama) prüfen. Der Bewertungs-Prompt
// liegt im Python-Backend; hier werden nur die Fakten der Frage gesendet.
export async function requestJustificationCheck(request, { fetchImpl = window.fetch.bind(window), apiBase = TUTOR_API_BASE } = {}) {
  const response = await fetchImpl(`${apiBase}/api/tutor/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Die KI-Prüfung ist fehlgeschlagen.");
  }
  const feedback = typeof payload?.feedback === "string" ? payload.feedback.trim() : "";
  if (!feedback) {
    throw new Error("Die KI hat keine Rückmeldung geliefert.");
  }
  return feedback;
}

export function renderAiTutorShell() {
  return `
    <button class="ai-tutor-fab" type="button" aria-label="KI-Tutor oeffnen" aria-expanded="false" aria-controls="ai-tutor-panel">
      <span aria-hidden="true">KI</span>
    </button>
    <aside class="ai-tutor-panel" id="ai-tutor-panel" aria-label="KI-Tutor" hidden>
      <header class="ai-tutor-header">
        <div>
          <strong>KI-Tutor</strong>
          <span class="ai-tutor-status">Python/Ollama wird geprueft</span>
        </div>
        <button class="ai-tutor-close" type="button" aria-label="KI-Tutor schliessen">x</button>
      </header>
      <div class="ai-tutor-messages" aria-live="polite"></div>
      <form class="ai-tutor-form">
        <label class="sr-only" for="ai-tutor-input">Frage an den KI-Tutor</label>
        <textarea id="ai-tutor-input" rows="2" placeholder="Frage zum aktuellen Buchhaltungsschritt..."></textarea>
        <button type="submit">Senden</button>
      </form>
    </aside>
  `;
}

export function initAiTutor({ root = document.querySelector(".app-shell"), fetchImpl = window.fetch.bind(window), apiBase = TUTOR_API_BASE } = {}) {
  if (!root || document.querySelector(".ai-tutor-fab")) return null;

  root.insertAdjacentHTML("beforeend", renderAiTutorShell());

  const fab = document.querySelector(".ai-tutor-fab");
  const panel = document.querySelector(".ai-tutor-panel");
  const closeButton = panel.querySelector(".ai-tutor-close");
  const status = panel.querySelector(".ai-tutor-status");
  const messagesContainer = panel.querySelector(".ai-tutor-messages");
  const form = panel.querySelector(".ai-tutor-form");
  const input = panel.querySelector("#ai-tutor-input");
  const submitButton = form.querySelector("button[type='submit']");
  const messages = [{ ...INITIAL_MESSAGE }];

  renderMessages(messagesContainer, messages);
  updateHealth(fetchImpl, apiBase, status);

  fab.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content) return;

    messages.push({ role: "user", content });
    input.value = "";
    submitButton.disabled = true;
    status.textContent = "Tutor denkt nach";
    renderMessages(messagesContainer, messages);

    try {
      const payload = buildTutorPayload({ messages });
      const response = await fetchImpl(`${apiBase}/api/tutor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await response.json();
      if (!response.ok) throw new Error(responsePayload.error || "Der Tutor konnte nicht antworten.");
      messages.push({ role: "assistant", content: normalizeTutorAnswer(responsePayload) });
      status.textContent = "Bereit";
    } catch (error) {
      messages.push({ role: "assistant", content: `Ich kann gerade nicht antworten: ${error.message}` });
      status.textContent = "Python/Ollama nicht erreichbar";
    } finally {
      submitButton.disabled = false;
      renderMessages(messagesContainer, messages);
      input.focus();
    }
  });

  function setOpen(isOpen) {
    panel.hidden = !isOpen;
    fab.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) input.focus();
  }

  return { panel, messages };
}

function renderMessages(container, messages) {
  container.innerHTML = messages
    .map((message) => `<div class="ai-tutor-message ai-tutor-message--${message.role}">${escapeTutorHtml(message.content)}</div>`)
    .join("");
  container.scrollTop = container.scrollHeight;
}

async function updateHealth(fetchImpl, apiBase, status) {
  try {
    const response = await fetchImpl(`${apiBase}/api/tutor/health`);
    const payload = await response.json();
    status.textContent = payload.ok ? `Bereit mit ${payload.model}` : `Ollama pruefen: ${payload.model}`;
  } catch {
    status.textContent = "Python/Ollama nicht erreichbar";
  }
}

function getRouteHash() {
  return typeof window === "undefined" ? "" : window.location.hash;
}

function getScreenText() {
  if (typeof document === "undefined") return "";
  return document.querySelector("#app .screen__content, #app")?.textContent ?? "";
}

function normalizeScreenText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 2400);
}

function getScreenTitle() {
  if (typeof document === "undefined") return "FinanceGame";
  return document.querySelector("#app h2, #app h1")?.textContent?.trim() || "FinanceGame";
}

function escapeTutorHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
