import test from "node:test";
import assert from "node:assert/strict";

import { evaluateTrueFalse, buildJustificationCheckRequest, answerLabel } from "../src/domain/theoryQuestions.js";
import theoriefragen from "../src/content/tasks/theoriefragen.json" with { type: "json" };

test("theory question content has 20 unique true/false questions with explanations", () => {
  assert.equal(theoriefragen.questions.length, 20);
  const ids = new Set();
  for (const question of theoriefragen.questions) {
    assert.ok(question.statement.length > 10, `${question.id} needs a statement`);
    assert.equal(typeof question.answer, "boolean", `${question.id} answer must be boolean`);
    assert.ok(question.explanation.length > 15, `${question.id} needs an explanation`);
    assert.ok(!ids.has(question.id), `duplicate id ${question.id}`);
    ids.add(question.id);
  }
  // Beide Wahrheitswerte kommen vor, damit es kein Ratemuster gibt.
  const trueCount = theoriefragen.questions.filter((q) => q.answer === true).length;
  assert.ok(trueCount >= 5 && trueCount <= 15, "mix of true and false answers expected");
});

test("evaluateTrueFalse reports answered state and correctness", () => {
  const question = { answer: true };
  assert.deepEqual(evaluateTrueFalse(question, true), { answered: true, correct: true });
  assert.deepEqual(evaluateTrueFalse(question, false), { answered: true, correct: false });
  assert.deepEqual(evaluateTrueFalse(question, null), { answered: false, correct: false });
});

test("buildJustificationCheckRequest forwards only facts, no prompt text", () => {
  const question = { statement: "Die Kasse zählt zu den Aktiven.", answer: true };

  const correct = buildJustificationCheckRequest(question, true, "  Bargeld ist Vermögen.  ");
  assert.deepEqual(correct, {
    statement: "Die Kasse zählt zu den Aktiven.",
    correct_answer: "wahr",
    user_answer: "wahr",
    answer_correct: true,
    justification: "Bargeld ist Vermögen.",
  });

  const wrong = buildJustificationCheckRequest(question, false, "");
  assert.equal(wrong.user_answer, "falsch");
  assert.equal(wrong.answer_correct, false);
  assert.equal(wrong.justification, "");

  const unanswered = buildJustificationCheckRequest(question, null, undefined);
  assert.equal(unanswered.user_answer, "keine");
});

test("answerLabel maps booleans to German labels", () => {
  assert.equal(answerLabel(true), "Wahr");
  assert.equal(answerLabel(false), "Falsch");
});
