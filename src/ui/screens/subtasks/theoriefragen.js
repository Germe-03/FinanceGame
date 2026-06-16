import theoriefragen from "../../../content/tasks/theoriefragen.json" with { type: "json" };
import { evaluateTrueFalse, buildJustificationCheckRequest, answerLabel } from "../../../domain/theoryQuestions.js";
import { requestJustificationCheck } from "../../components/aiTutor.js";
import { ROUTES } from "../../../domain/navigation.js";
import { appRoot, escapeHtml } from "../../dom.js";
import { navigateTo } from "../../router.js";

// #TODO: Sobald die Aufgabe rund läuft, pro Durchgang nur noch 10 der 20 Fragen
// zufällig ziehen, damit nicht immer dieselben kommen. Setzt voraus, dass wir
// (z. B. in localStorage über src/ui/progress.js) speichern, welche Fragen die
// Person schon gelöst hat, und daraus die noch offenen bevorzugt ziehen.
// Erst mit dieser Persistenz umsetzen.

const questionsById = new Map(theoriefragen.questions.map((question) => [question.id, question]));

// Aufgabe 1.4: 20 Wahr/Falsch-Aussagen, jede mit Pflicht-Begründung. «Prüfen»
// zeigt die Lösung samt Begründung (immer, lokal); zusätzlich prüft Ollama die
// eingetippte Begründung wohlwollend (serverseitiger Prompt, degradiert sauber).
export function renderTheoriefragenScreen(topic, subtask) {
  const selections = Object.fromEntries(theoriefragen.questions.map((question) => [question.id, null]));

  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="theorie-title">
      <div class="screen__content screen__content--wide">
        <button class="back-button" type="button" id="back-to-overview">Zurück zur Übersicht</button>
        <p class="eyebrow">${escapeHtml(topic.nr)} ${escapeHtml(topic.title)} · Aufgabe ${escapeHtml(subtask.nr)}</p>
        <h2 id="theorie-title">${escapeHtml(subtask.title)}</h2>
        <p class="lead">${escapeHtml(theoriefragen.lead)}</p>
        <ol class="theorie-list">
          ${theoriefragen.questions.map((question, index) => renderQuestion(question, index)).join("")}
        </ol>
        <div class="configuration-actions">
          <button class="secondary-action" type="button" id="theorie-back">Zurück zur Übersicht</button>
          <button class="primary-action" type="button" id="theorie-check">Prüfen</button>
        </div>
      </div>
    </section>
  `;

  document.querySelector("#back-to-overview").addEventListener("click", () => navigateTo(ROUTES.game));
  document.querySelector("#theorie-back").addEventListener("click", () => navigateTo(ROUTES.game));

  const list = appRoot.querySelector(".theorie-list");

  list.addEventListener("click", (event) => {
    const choice = event.target.closest(".theorie-choice");
    if (!choice) return;
    const card = choice.closest(".theorie-card");
    selections[card.dataset.qid] = choice.dataset.answer === "true";
    card.querySelectorAll(".theorie-choice").forEach((button) => {
      const active = button === choice;
      button.classList.toggle("theorie-choice--selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
  });

  const checkButton = document.querySelector("#theorie-check");
  checkButton.addEventListener("click", async () => {
    list.querySelectorAll(".theorie-card").forEach((card) => revealSolution(card, selections));
    checkButton.disabled = true;
    checkButton.textContent = "KI prüft …";
    await runJustificationChecks(list, selections);
    checkButton.disabled = false;
    checkButton.textContent = "Erneut prüfen";
  });
}

function renderQuestion(question, index) {
  return `
    <li class="theorie-card" data-qid="${escapeHtml(question.id)}">
      <p class="theorie-statement"><span class="theorie-nr">${index + 1}</span>${escapeHtml(question.statement)}</p>
      <div class="theorie-choices" role="group" aria-label="Wahr oder falsch für Aussage ${index + 1}">
        <button class="theorie-choice" type="button" data-answer="true" aria-pressed="false">Wahr</button>
        <button class="theorie-choice" type="button" data-answer="false" aria-pressed="false">Falsch</button>
      </div>
      <label class="theorie-just-label" for="theorie-just-${escapeHtml(question.id)}">Begründung</label>
      <textarea class="theorie-just" id="theorie-just-${escapeHtml(question.id)}" rows="2"
        placeholder="Begründe Dein Kreuz in einem Satz."></textarea>
      <div class="theorie-feedback" hidden>
        <p class="theorie-solution"></p>
        <p class="theorie-ai"></p>
      </div>
    </li>
  `;
}

function revealSolution(card, selections) {
  const question = questionsById.get(card.dataset.qid);
  const selection = selections[card.dataset.qid];
  const { answered, correct } = evaluateTrueFalse(question, selection);

  card.querySelectorAll(".theorie-choice").forEach((button) => {
    const isCorrectButton = (button.dataset.answer === "true") === question.answer;
    const isChosen = (button.dataset.answer === "true") === selection;
    button.classList.toggle("theorie-choice--correct", isCorrectButton);
    button.classList.toggle("theorie-choice--wrong", isChosen && !isCorrectButton);
  });

  const feedback = card.querySelector(".theorie-feedback");
  const solution = card.querySelector(".theorie-solution");
  feedback.hidden = false;
  feedback.className = `theorie-feedback ${answered && correct ? "theorie-feedback--correct" : "theorie-feedback--wrong"}`;
  const verdict = !answered ? "Nicht beantwortet." : correct ? "Richtig." : "Noch nicht.";
  solution.textContent = `${verdict} Richtige Antwort: ${answerLabel(question.answer)}. ${question.explanation}`;
}

async function runJustificationChecks(list, selections) {
  let tutorDown = false;
  for (const card of list.querySelectorAll(".theorie-card")) {
    const ai = card.querySelector(".theorie-ai");
    const question = questionsById.get(card.dataset.qid);
    const selection = selections[card.dataset.qid];
    const justification = card.querySelector(".theorie-just").value.trim();

    if (selection === null) {
      ai.textContent = "";
      continue;
    }
    if (!justification) {
      ai.textContent = "Tipp: Mit einer eigenen Begründung gibt Dir die KI eine Rückmeldung.";
      continue;
    }
    if (tutorDown) {
      ai.textContent = "KI-Prüfung nicht verfügbar.";
      continue;
    }

    ai.textContent = "KI prüft Deine Begründung …";
    try {
      const feedback = await requestJustificationCheck(buildJustificationCheckRequest(question, selection, justification));
      ai.textContent = `KI: ${feedback.replace(/ß/g, "ss")}`;
    } catch {
      tutorDown = true;
      ai.textContent = "KI-Prüfung nicht verfügbar (läuft der Tutor-Server und Ollama?).";
    }
  }
}
