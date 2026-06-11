import { calculateExpression } from "../../domain/calculator.js";
import { escapeHtml } from "../dom.js";

export function renderCalculatorPopup() {
  return `
    <form class="calculator-form" aria-label="Taschenrechner">
      <label class="calculator-label" for="calculator-expression">Rechnung</label>
      <div class="calculator-entry-row">
        <input class="calculator-display" id="calculator-expression" data-calculator-expression inputmode="decimal" autocomplete="off" placeholder="z.B. 565 + 134.10">
        <button class="calculator-evaluate-button" type="submit">Berechnen</button>
      </div>
      <label class="calculator-label" for="calculator-result">Ergebnis</label>
      <div class="calculator-result-row">
        <input class="calculator-result" id="calculator-result" data-calculator-result readonly value="0.00">
        <button class="calculator-copy-button" type="button" data-calculator-copy>Kopieren</button>
      </div>
      <div class="calculator-keypad" aria-label="Taschenrechner-Tasten">
        ${renderCalculatorKeys()}
      </div>
      <p class="calculator-copy-feedback" role="status" aria-live="polite"></p>
    </form>
  `;
}

function renderCalculatorKeys() {
  const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "+", "(", ")", "⌫", "="];
  return keys
    .map((key) => {
      const action = key === "C" ? "clear" : key === "⌫" ? "backspace" : key === "=" ? "evaluate" : "insert";
      return `<button class="calculator-key" type="button" data-calculator-key="${escapeHtml(key)}" data-calculator-action="${action}">${escapeHtml(key)}</button>`;
    })
    .join("");
}

export function initCalculator(container) {
  const form = container.querySelector(".calculator-form");
  const expression = container.querySelector("[data-calculator-expression]");
  const result = container.querySelector("[data-calculator-result]");
  const feedback = container.querySelector(".calculator-copy-feedback");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateAndShowResult();
  });

  container.querySelectorAll("[data-calculator-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.calculatorAction;
      if (action === "clear") {
        expression.value = "";
        result.value = "0.00";
        feedback.textContent = "";
        expression.focus();
        return;
      }
      if (action === "backspace") {
        expression.value = expression.value.slice(0, -1);
        expression.focus();
        return;
      }
      if (action === "evaluate") {
        calculateAndShowResult();
        return;
      }
      expression.value += button.dataset.calculatorKey;
      expression.focus();
    });
  });

  container.querySelector("[data-calculator-copy]").addEventListener("click", async () => {
    const value = result.value === "0.00" && expression.value.trim() ? calculateAndShowResult() : result.value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      feedback.textContent = "Ergebnis kopiert. Du kannst es jetzt mit Ctrl + V einfuegen.";
    } catch {
      result.focus();
      result.select();
      feedback.textContent = "Kopieren wurde blockiert. Das Ergebnis ist markiert und kann manuell kopiert werden.";
    }
  });

  function calculateAndShowResult() {
    try {
      const calculated = calculateExpression(expression.value);
      result.value = calculated.display;
      feedback.textContent = "Ergebnis berechnet.";
      return calculated.display;
    } catch (error) {
      feedback.textContent = error.message;
      return "";
    }
  }
}
