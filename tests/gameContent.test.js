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

test("task one starts with 20 tasks using only active and passive accounts", () => {
  assert.equal(gameRound.balanceOnlyTasks.title, "Nur Aktiv- und Passivkonten");
  assert.equal(gameRound.balanceOnlyTasks.tasks.length, 20);

  for (const task of gameRound.balanceOnlyTasks.tasks) {
    assert.ok(task.id);
    assert.ok(task.scenario.length > 20);
    if (task.noBooking) continue;
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
    if (task.noBooking) continue;

    const bookings = task.bookings ?? [task];
    assert.ok(bookings.length >= 1, `${task.id} has no bookings`);
    for (const b of bookings) {
      assert.ok(b.amount.startsWith("CHF "), `${task.id} amount`);
      assert.ok(mixedAccountTypes.has(b.debit.type), `${task.id} debit type`);
      assert.ok(mixedAccountTypes.has(b.credit.type), `${task.id} credit type`);
      seenTypes.add(b.debit.type);
      seenTypes.add(b.credit.type);
    }
  }

  assert.ok(seenTypes.has("active"));
  assert.ok(seenTypes.has("passive"));
  assert.ok(seenTypes.has("expense"));
  assert.ok(seenTypes.has("revenue"));
});

test("compound tasks have at least two bookings", () => {
  const compound = gameRound.mixedTasks.tasks.filter((t) => t.bookings);
  assert.ok(compound.length >= 2, "at least two compound tasks expected");
  for (const task of compound) {
    assert.ok(task.bookings.length >= 2, `${task.id} must have ≥ 2 bookings`);
  }
});

test("no-booking tasks exist in both sections and carry an explanation", () => {
  const noBookingBalance = gameRound.balanceOnlyTasks.tasks.filter((t) => t.noBooking);
  const noBookingMixed = gameRound.mixedTasks.tasks.filter((t) => t.noBooking);

  assert.equal(noBookingBalance.length, 1, "one no-booking task in balanceOnly");
  assert.equal(noBookingMixed.length, 3, "three no-booking tasks in mixed");

  for (const task of [...noBookingBalance, ...noBookingMixed]) {
    assert.ok(task.noBookingReason, `${task.id} must have noBookingReason`);
    assert.ok(task.noBookingReason.length > 20, `${task.id} reason too short`);
    assert.equal(task.amount, undefined, `${task.id} noBooking task must not have amount`);
  }
});
