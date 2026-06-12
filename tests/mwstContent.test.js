import test from "node:test";
import assert from "node:assert/strict";

import { accountPlan } from "../src/content/accountPlan.js";
import { gameRound } from "../src/content/gameRound.js";
import { evaluateLedgerClosing, getAccountLedgerItems, parseAmount } from "../src/domain/ledger.js";

const accountPlanNames = new Set(accountPlan.map((account) => account.name));
const VORSTEUER_1170 = "Vorsteuer Material, Waren, DL, Energie";
const VORSTEUER_1171 = "Vorsteuer Investitionen, übriger Betriebsaufwand";
const GESCHULDETE_MWST = "Geschuldete MWST";

test("account plan includes the MWST and payroll accounts", () => {
  const byName = new Map(accountPlan.map((account) => [account.name, account.number]));
  assert.equal(byName.get(VORSTEUER_1170), "1170");
  assert.equal(byName.get(VORSTEUER_1171), "1171");
  assert.equal(byName.get(GESCHULDETE_MWST), "2200");
  assert.equal(byName.get("Lohnaufwand"), "5000");
});

test("mwst classification asks vorsteuer vs geschuldet with trick cases", () => {
  const section = gameRound.mwst.classification;
  assert.equal(section.tasks.length, 10);

  const optionIds = new Set(section.choiceOptions.map((option) => option.id));
  assert.deepEqual([...optionIds].sort(), ["geschuldet", "keine", "vorsteuer"]);

  for (const task of section.tasks) {
    assert.ok(task.id.startsWith("MZ-"), task.id);
    assert.ok(task.scenario.length > 20, `${task.id} scenario too short`);
    assert.ok(optionIds.has(task.correct), `${task.id} correct=${task.correct} not an option`);
    assert.ok(task.explanation.length > 40, `${task.id} explanation too short`);
  }

  const trickCases = section.tasks.filter((task) => task.correct === "keine");
  assert.ok(trickCases.length >= 3, "at least three no-MWST trick cases expected");
});

test("mwst vorsteuer split distinguishes 1170 and 1171 including no-deduction cases", () => {
  const section = gameRound.mwst.vorsteuerSplit;
  assert.equal(section.tasks.length, 10);

  const optionIds = new Set(section.choiceOptions.map((option) => option.id));
  assert.deepEqual([...optionIds].sort(), ["1170", "1171", "keine"]);

  const counts = { 1170: 0, 1171: 0, keine: 0 };
  for (const task of section.tasks) {
    assert.ok(task.id.startsWith("VS-"), task.id);
    assert.ok(optionIds.has(task.correct), `${task.id} correct=${task.correct} not an option`);
    assert.ok(task.explanation.length > 40, `${task.id} explanation too short`);
    counts[task.correct]++;
  }
  assert.ok(counts["1170"] >= 2, "needs 1170 cases");
  assert.ok(counts["1171"] >= 3, "needs 1171 cases");
  assert.ok(counts.keine >= 2, "needs trick cases without Vorsteuerabzug");
});

test("basic mwst bookings use one vorsteuer account and contain no-MWST trick bookings", () => {
  const section = gameRound.mwst.bookingsBasic;
  assert.equal(section.tasks.length, 6);

  const accountTypes = new Set(["active", "passive", "expense", "revenue"]);
  const usedAccounts = new Set();
  for (const task of section.tasks) {
    for (const booking of task.bookings ?? [task]) {
      usedAccounts.add(booking.debit.account);
      usedAccounts.add(booking.credit.account);
      assert.ok(accountPlanNames.has(booking.debit.account), `${task.id}: ${booking.debit.account} missing from accountPlan`);
      assert.ok(accountPlanNames.has(booking.credit.account), `${task.id}: ${booking.credit.account} missing from accountPlan`);
      assert.ok(accountTypes.has(booking.debit.type), `${task.id}: debit type missing for ${booking.debit.account}`);
      assert.ok(accountTypes.has(booking.credit.type), `${task.id}: credit type missing for ${booking.credit.account}`);
      assert.ok(typeof booking.amount === "number" && booking.amount > 0, `${task.id}: amount must be a positive number`);
    }
  }
  assert.ok(usedAccounts.has(VORSTEUER_1170));
  assert.ok(!usedAccounts.has(VORSTEUER_1171), "1171 belongs to the advanced stage");
  assert.ok(usedAccounts.has(GESCHULDETE_MWST));

  // Trick: Lohn und Zins lösen keine MWST aus.
  const wage = section.tasks.find((task) => task.id === "MB-05");
  const interest = section.tasks.find((task) => task.id === "MB-06");
  assert.equal(wage.debit.account, "Lohnaufwand");
  assert.equal(interest.credit.account, "Finanzertrag");
  for (const task of [wage, interest]) {
    for (const booking of task.bookings ?? [task]) {
      assert.ok(![VORSTEUER_1170, VORSTEUER_1171, GESCHULDETE_MWST].includes(booking.debit.account), `${task.id} must not book MWST`);
      assert.ok(![VORSTEUER_1170, VORSTEUER_1171, GESCHULDETE_MWST].includes(booking.credit.account), `${task.id} must not book MWST`);
    }
  }

  // Bruttoaufgabe: Kassenbetrag = Netto + MWST.
  const cashSale = section.tasks.find((task) => task.id === "MB-03");
  const total = cashSale.bookings.reduce((sum, booking) => sum + parseAmount(booking.amount), 0);
  assert.ok(Math.abs(total - 2162) < 0.005, "MB-03 brutto must equal 2'162.00");
});

test("advanced mwst bookings apply the correct rates for takeaway and restaurant", () => {
  const section = gameRound.mwst.bookingsAdvanced;
  assert.equal(section.tasks.length, 10);

  // Takeaway: reduzierter Satz 2.6 % auf netto 100.00.
  const takeaway = section.tasks.find((task) => task.id === "MV-03");
  assert.match(takeaway.scenario, /Takeaway/);
  const takeawayVat = takeaway.bookings.find((booking) => booking.debit.account === VORSTEUER_1171);
  const takeawayNet = takeaway.bookings.find((booking) => booking.debit.account !== VORSTEUER_1171);
  assert.ok(Math.abs(parseAmount(takeawayVat.amount) - parseAmount(takeawayNet.amount) * 0.026) < 0.005, "takeaway must use 2.6%");

  // Restaurant vor Ort: Normalsatz 8.1 % auf netto 200.00.
  const restaurant = section.tasks.find((task) => task.id === "MV-04");
  assert.match(restaurant.scenario, /Restaurant/);
  const restaurantVat = restaurant.bookings.find((booking) => booking.debit.account === VORSTEUER_1171);
  const restaurantNet = restaurant.bookings.find((booking) => booking.debit.account !== VORSTEUER_1171);
  assert.ok(Math.abs(parseAmount(restaurantVat.amount) - parseAmount(restaurantNet.amount) * 0.081) < 0.005, "restaurant must use 8.1%");

  // Trick-Fälle ohne MWST: Versicherung und Miete.
  for (const id of ["MV-05", "MV-08"]) {
    const task = section.tasks.find((candidate) => candidate.id === id);
    for (const booking of task.bookings ?? [task]) {
      assert.ok(![VORSTEUER_1170, VORSTEUER_1171, GESCHULDETE_MWST].includes(booking.debit.account), `${id} must not book MWST`);
      assert.ok(![VORSTEUER_1170, VORSTEUER_1171, GESCHULDETE_MWST].includes(booking.credit.account), `${id} must not book MWST`);
    }
  }
});

test("the ESTV settlement matches the accumulated vorsteuer of both booking stages", () => {
  const allBookingTasks = [...gameRound.mwst.bookingsBasic.tasks, ...gameRound.mwst.bookingsAdvanced.tasks];

  for (const accountName of [VORSTEUER_1170, VORSTEUER_1171]) {
    const items = getAccountLedgerItems(allBookingTasks, accountName);
    const soll = items.filter((item) => item.side === "soll").reduce((sum, item) => sum + item.amountValue, 0);
    const haben = items.filter((item) => item.side === "haben").reduce((sum, item) => sum + item.amountValue, 0);
    assert.ok(haben > 0, `${accountName} must be settled by MV-10`);
    assert.ok(Math.abs(soll - haben) < 0.005, `${accountName} must balance to zero after settlement`);
  }
});

test("the mwst t-konto saldo equals the zahllast towards the ESTV", () => {
  const tKonto = gameRound.mwst.tKonto;
  assert.equal(tKonto.accountName, GESCHULDETE_MWST);
  assert.equal(tKonto.accountNumber, "2200");
  assert.equal(tKonto.items.length, 6);

  const perfectPlacements = Object.fromEntries(tKonto.items.map((item) => [item.id, item.side]));
  const result = evaluateLedgerClosing(tKonto.items, perfectPlacements, {
    saldo: "159.40",
    saldoSide: "soll",
    kontrollsumme: "923.40",
  });

  assert.equal(result.placementScore, tKonto.items.length);
  assert.equal(result.userSaldoOk, true, `expected zahllast 159.40, got ${result.correctSaldo}`);
  assert.equal(result.userSaldoSideOk, true, `saldo side must be soll, got ${result.correctSaldoSide}`);
  assert.equal(result.userKsOk, true, `expected kontrollsumme 923.40, got ${result.correctKS}`);
});

test("the bank t-konto links forward to aufgabe 5", () => {
  assert.equal(gameRound.tKontoBank.nextRoute, "spiel/mwst/zuordnen");
  assert.match(gameRound.tKontoBank.nextLabel, /Aufgabe 5/);
});
