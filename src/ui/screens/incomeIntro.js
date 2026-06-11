import { gameRound } from "../../content/gameRound.js";
import { ROUTES } from "../../domain/navigation.js";
import { renderLernmoduleSidebar } from "../components/sidebar.js";
import { renderGameSupportActions } from "../components/supportModal.js";
import { appRoot, escapeHtml } from "../dom.js";
import { navigateTo } from "../router.js";

export function renderIncomeStatementIntroScreen() {
  appRoot.innerHTML = `
    <section class="screen screen--game" aria-labelledby="income-intro-title">
      <div class="game-outer-layout">
        ${renderLernmoduleSidebar()}
        <div>
          <div class="screen__content game-shell">
            <button class="back-button" type="button" id="back-to-case">Zurück zum Fallbeschrieb</button>
            <div class="game-stage-head">
              <p class="eyebrow">Aufgabe 2 · Schritt 2 von 3</p>
              <h2 id="income-intro-title">${escapeHtml(gameRound.incomeStatementIntro.title)}</h2>
              <p class="lead">${escapeHtml(gameRound.incomeStatementIntro.body)}</p>
            </div>
            <div class="intro-panel" aria-label="Übergang zur Erfolgsrechnung">
              <h3>Merke Dir für die nächsten Aufgaben</h3>
              <ul>
                <li>Aufwand steht typischerweise im Soll.</li>
                <li>Ertrag steht typischerweise im Haben.</li>
                <li>Aktiv- und Passivkonten bleiben weiterhin Teil vieler Buchungssätze.</li>
              </ul>
            </div>
            <div class="configuration-actions">
              <button class="primary-action" type="button" id="game-next-button">${escapeHtml(gameRound.incomeStatementIntro.nextButtonLabel)}</button>
            </div>
          </div>
        </div>
      </div>
      ${renderGameSupportActions()}
    </section>
  `;

  document.querySelector("#back-to-case").addEventListener("click", () => navigateTo(ROUTES.case));
  document.querySelector("#game-next-button").addEventListener("click", () => navigateTo(ROUTES.gameMixed));
}
