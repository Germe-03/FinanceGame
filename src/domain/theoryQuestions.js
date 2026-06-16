// Reine Logik für die Wahr/Falsch-Theoriefragen (Aufgabe 1.4).

// Wertet das Kreuz aus. userAnswer ist true (wahr), false (falsch) oder null.
export function evaluateTrueFalse(question, userAnswer) {
  return {
    answered: userAnswer === true || userAnswer === false,
    correct: userAnswer === question.answer,
  };
}

// Baut die Daten für die serverseitige KI-Prüfung der Begründung. Es werden nur
// Fakten übergeben — der Bewertungs-Prompt lebt im Python-Backend, nie im JS.
export function buildJustificationCheckRequest(question, userAnswer, justification) {
  return {
    statement: question.statement,
    correct_answer: question.answer ? "wahr" : "falsch",
    user_answer: userAnswer === true ? "wahr" : userAnswer === false ? "falsch" : "keine",
    answer_correct: userAnswer === question.answer,
    justification: String(justification ?? "").trim(),
  };
}

export function answerLabel(value) {
  return value ? "Wahr" : "Falsch";
}
