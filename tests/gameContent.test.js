import test from "node:test";
import assert from "node:assert/strict";

import { accountPlan } from "../src/content/accountPlan.js";
import { gameRound } from "../src/content/gameRound.js";

const balanceAccountTypes = new Set(["active", "passive"]);
const mixedAccountTypes = new Set(["active", "passive", "expense", "revenue"]);
const accountPlanNames = new Set(accountPlan.map((account) => account.name));
const accountPlanByName = new Map(accountPlan.map((account) => [account.name, account.number]));

test("account plan includes invoice task expense accounts", () => {
  assert.equal(accountPlanByName.get("Energieaufwand"), "6400");
  assert.equal(accountPlanByName.get("Verwaltungsaufwand"), "6500");
  assert.equal(accountPlanByName.get("Informatikaufwand"), "6570");
});
test("game round exposes the requested task order", () => {
  assert.deepEqual(
    gameRound.taskSequence.map((task) => task.id),
    [
      "account-plan", "booking-balance", "booking-income-intro", "booking-mixed", "invoice-booking", "t-konto-bank",
      "mwst-classify", "mwst-booking-basic", "mwst-vorsteuer-split", "mwst-booking-advanced", "mwst-t-konto",
    ],
  );
  assert.deepEqual(
    gameRound.taskSequence.map((task) => task.title),
    [
      "Aufgabe 1: Kontenplan-Suchspiel",
      "Aufgabe 2: Nur Aktiv- und Passivkonten",
      "Aufgabe 2: Aufwand und Ertrag kommen dazu",
      "Aufgabe 2: Gemischte Buchungssätze",
      "Aufgabe 3: Rechnung kontieren",
      "Aufgabe 4: T-Konto Bank",
      "Aufgabe 5: Vorsteuer oder geschuldete MWST?",
      "Aufgabe 5: Buchen mit MWST",
      "Aufgabe 5: Vorsteuer 1170 oder 1171?",
      "Aufgabe 5: Buchen mit 1170 und 1171",
      "Aufgabe 5: T-Konto Geschuldete MWST",
    ],
  );
});

test("game round defines reference actions for the accounting task", () => {
  assert.equal(gameRound.title, "FinanceGame Aufgaben");
  assert.equal(gameRound.bookingTask.title, "Aufgabe 2: Buchungssätze");

  assert.deepEqual(
    gameRound.referenceActions.map((action) => action.label),
    ["KMU-Kontenplan", "OR"],
  );
  assert.equal(gameRound.referenceActions[0].href, "./assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf");
  assert.equal(gameRound.referenceActions[1].href, "./assets/legal/or/or.pdf");

  assert.equal(gameRound.buddyAction.label, "KI-Buddy");
  assert.equal(gameRound.buddyAction.enabled, false);
});

test("task one is an account-plan search game with unique correct choices and explanations", () => {
  assert.equal(gameRound.accountPlanSearch.title, "Aufgabe 1: Kontenplan-Suchspiel");
  assert.equal(gameRound.accountPlanSearch.tasks.length, 20);

  for (const task of gameRound.accountPlanSearch.tasks) {
    assert.ok(task.id.startsWith("KP-"));
    assert.ok(task.scenario.length > 20);
    assert.ok(accountPlanNames.has(task.correctAccount), `${task.id}: ${task.correctAccount} missing from accountPlan`);
    assert.ok(["active", "passive", "expense", "revenue"].includes(task.correctType));
    assert.equal(task.options.filter((option) => option.account === task.correctAccount).length, 1);
    assert.equal(task.options.length, 4);
    for (const option of task.options) {
      assert.ok(accountPlanNames.has(option.account), `${task.id}: ${option.account} missing from accountPlan`);
      assert.ok(["active", "passive", "expense", "revenue"].includes(option.type));
    }
    assert.match(task.explanation, new RegExp(task.correctAccount));
    assert.ok(task.explanation.length > 80);
  }
});

test("task one uses the configured answer position sequence", () => {
  const correctPositions = gameRound.accountPlanSearch.tasks.map((task) =>
    task.options.findIndex((option) => option.account === task.correctAccount) + 1,
  );

  assert.deepEqual(correctPositions, [2, 3, 1, 1, 3, 3, 4, 2, 3, 2, 1, 4, 3, 1, 2, 2, 4, 1, 2, 1]);
});

test("task one includes correct and wrong choices for the laptop example", () => {
  const laptop = gameRound.accountPlanSearch.tasks.find((task) => task.id === "KP-10");
  assert.ok(laptop);
  assert.match(laptop.scenario, /Laptop/);
  assert.equal(laptop.correctAccount, "Büromaschinen");
  assert.equal(laptop.correctType, "active");
  assert.ok(laptop.options.some((option) => option.account === "Informatikaufwand"));
  assert.ok(laptop.options.some((option) => option.account === "Maschinen"));
  assert.match(laptop.explanation, /mehrere Jahre/);
});

test("previous task one is now task two and its booking content stays intact", () => {
  assert.equal(gameRound.bookingTask.title, "Aufgabe 2: Buchungssätze");
  assert.equal(gameRound.balanceOnlyTasks, gameRound.bookingTask.balanceOnlyTasks);
  assert.equal(gameRound.incomeStatementIntro, gameRound.bookingTask.incomeStatementIntro);
  assert.equal(gameRound.mixedTasks, gameRound.bookingTask.mixedTasks);

  assert.equal(gameRound.balanceOnlyTasks.tasks.length, 20);
  assert.equal(gameRound.mixedTasks.tasks.length, 40);
  assert.match(gameRound.balanceOnlyTasks.tasks[0].scenario, /Tischkreissäge|Tischkreiss/);
  assert.match(gameRound.balanceOnlyTasks.tasks[19].scenario, /Gesellschafter/);
  assert.equal(gameRound.mixedTasks.tasks.find((task) => task.id === "GE-17").bookings.length, 2);
  assert.equal(gameRound.mixedTasks.tasks.find((task) => task.id === "GE-40").bookings.length, 3);
});

test("task two starts with 20 tasks using only active and passive accounts", () => {
  assert.equal(gameRound.balanceOnlyTasks.title, "Nur Aktiv- und Passivkonten");
  assert.equal(gameRound.balanceOnlyTasks.tasks.length, 20);

  for (const task of gameRound.balanceOnlyTasks.tasks) {
    assert.ok(task.id);
    assert.ok(task.scenario.length > 20);
    if (task.noBooking) continue;
    assert.ok(typeof task.amount === "number" && task.amount > 0, `${task.id} amount must be a positive number`);
    assert.ok(task.debit.account);
    assert.ok(task.credit.account);
    assert.ok(balanceAccountTypes.has(task.debit.type), task.id);
    assert.ok(balanceAccountTypes.has(task.credit.type), task.id);
  }
});

test("task two explains expenses and revenues before mixed tasks start", () => {
  assert.match(gameRound.incomeStatementIntro.title, /Aufwand und Ertrag/);
  assert.match(gameRound.incomeStatementIntro.body, /Aufwand/);
  assert.match(gameRound.incomeStatementIntro.body, /Ertrag/);
  assert.equal(gameRound.incomeStatementIntro.nextButtonLabel, "Weiter");
});

test("task two continues with 40 mixed active passive expense and revenue bookings", () => {
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
      assert.ok(typeof b.amount === "number" && b.amount > 0, `${task.id} amount must be a positive number`);
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
    assert.ok(task.bookings.length >= 2, `${task.id} must have >= 2 bookings`);
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

test("task three introduces five invoice booking tasks with image references", () => {
  assert.equal(gameRound.invoiceBooking.title, "Aufgabe 3: Rechnung kontieren");
  assert.equal(gameRound.invoiceBooking.tasks.length, 5);

  gameRound.invoiceBooking.tasks.forEach((task, index) => {
    const number = index + 1;
    assert.equal(task.id, `RG-0${number}`);
    assert.equal(task.image.src, `./assets/accounting/rechnungen/rechnung_${number}.png`);
    assert.match(task.image.alt, new RegExp(`Rechnung ${number}`));
    assert.ok(task.scenario.length > 20);
    assert.ok(typeof task.amount === "number" && task.amount > 0, `${task.id} amount must be a positive number`);
    assert.ok(task.debit.account);
    assert.ok(task.credit.account);
  });

  const expectedInvoiceSolutions = [
    ["RG-01", /Papeterie Mueller AG/, 123.10, "Verwaltungsaufwand", "Verbindlichkeiten LL"],
    ["RG-02", /TechSupport Bern GmbH/, 565.00, "Informatikaufwand", "Verbindlichkeiten LL"],
    ["RG-03", /EKZ Elektrizitaetswerke/, 372.00, "Energieaufwand", "Verbindlichkeiten LL"],
    ["RG-04", /Immobilien Keller AG/, 1800.00, "Raumaufwand", "Verbindlichkeiten LL"],
    ["RG-05", /Garage Schneider/, 415.00, "Fahrzeugaufwand", "Verbindlichkeiten LL"],
  ];

  for (const [id, scenarioPattern, amount, debitAccount, creditAccount] of expectedInvoiceSolutions) {
    const task = gameRound.invoiceBooking.tasks.find((invoiceTask) => invoiceTask.id === id);
    assert.ok(task, `${id} missing`);
    assert.match(task.scenario, scenarioPattern);
    assert.equal(task.amount, amount);
    assert.equal(task.debit.account, debitAccount);
    assert.equal(task.credit.account, creditAccount);
    assert.ok(accountPlanNames.has(task.debit.account), `${task.debit.account} missing from accountPlan`);
    assert.ok(accountPlanNames.has(task.credit.account), `${task.credit.account} missing from accountPlan`);
  }
});
