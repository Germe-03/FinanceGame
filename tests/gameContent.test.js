import test from "node:test";
import assert from "node:assert/strict";

import { gameRound } from "../src/content/gameRound.js";

const balanceAccountTypes = new Set(["active", "passive"]);
const mixedAccountTypes = new Set(["active", "passive", "expense", "revenue"]);

test("game round defines reference actions for the accounting task", () => {
  assert.equal(gameRound.title, "Aufgabe 1: Buchungssätze");

  assert.deepEqual(
    gameRound.referenceActions.map((action) => action.label),
    ["KMU-Kontenplan", "OR"],
  );
  assert.equal(gameRound.referenceActions[0].href, "./assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf");
  assert.equal(gameRound.referenceActions[1].href, "./assets/legal/or/or.pdf");

  assert.equal(gameRound.buddyAction.label, "KI-Buddy");
  assert.equal(gameRound.buddyAction.enabled, false);
});

test("task one starts with 20 business booking entries using only active and passive accounts", () => {
  assert.equal(gameRound.balanceOnlyTasks.title, "Nur Aktiv- und Passivkonten");
  assert.equal(gameRound.balanceOnlyTasks.tasks.length, 20);

  for (const task of gameRound.balanceOnlyTasks.tasks) {
    assert.ok(task.id);
    assert.ok(task.scenario.length > 20);
    assert.ok(task.amount.startsWith("CHF "));
    assert.ok(task.debit.account);
    assert.ok(task.credit.account);
    assert.ok(balanceAccountTypes.has(task.debit.type), task.id);
    assert.ok(balanceAccountTypes.has(task.credit.type), task.id);
  }
});

test("task one explains expenses and revenues before mixed tasks start", () => {
  assert.match(gameRound.incomeStatementIntro.title, /Aufwand und Ertrag/);
  assert.match(gameRound.incomeStatementIntro.body, /Aufwand/);
  assert.match(gameRound.incomeStatementIntro.body, /Ertrag/);
  assert.equal(gameRound.incomeStatementIntro.nextButtonLabel, "Weiter");
});

test("task one continues with 40 mixed active passive expense and revenue bookings", () => {
  assert.equal(gameRound.mixedTasks.title, "Gemischte Buchungssätze");
  assert.equal(gameRound.mixedTasks.tasks.length, 40);

  const seenTypes = new Set();
  for (const task of gameRound.mixedTasks.tasks) {
    assert.ok(task.id);
    assert.ok(task.scenario.length > 20);
    assert.ok(task.amount.startsWith("CHF "));
    assert.ok(mixedAccountTypes.has(task.debit.type), task.id);
    assert.ok(mixedAccountTypes.has(task.credit.type), task.id);
    seenTypes.add(task.debit.type);
    seenTypes.add(task.credit.type);
  }

  assert.ok(seenTypes.has("active"));
  assert.ok(seenTypes.has("passive"));
  assert.ok(seenTypes.has("expense"));
  assert.ok(seenTypes.has("revenue"));
});