import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateLedgerClosing,
  formatSwissAmount,
  getAccountLedgerItems,
  parseAmount,
} from "../src/domain/ledger.js";

const sampleTasks = [
  {
    id: "AP-01",
    scenario: "Maschine per Bank gekauft.",
    amount: "CHF 4'200.00",
    debit: { account: "Maschinen", type: "active" },
    credit: { account: "Bank", type: "active" },
  },
  {
    id: "AP-02",
    scenario: "Kunde zahlt auf Bank ein.",
    amount: "CHF 1'500.00",
    debit: { account: "Bank", type: "active" },
    credit: { account: "Forderungen LL", type: "active" },
  },
  {
    id: "AP-03",
    scenario: "Nur eine Absichtserklärung.",
    noBooking: true,
    noBookingReason: "Keine Buchung nötig.",
  },
  {
    id: "GE-01",
    scenario: "Zusammengesetzter Geschäftsfall.",
    bookings: [
      { amount: "CHF 800.00", debit: { account: "Materialaufwand", type: "expense" }, credit: { account: "Bank", type: "active" } },
      { amount: "CHF 120.00", debit: { account: "Sonstiger Betriebsaufwand", type: "expense" }, credit: { account: "Kasse", type: "active" } },
    ],
  },
];

test("getAccountLedgerItems collects soll and haben entries for one account", () => {
  const items = getAccountLedgerItems(sampleTasks, "Bank");

  assert.deepEqual(
    items.map(({ id, side, amountValue, counterAccount }) => ({ id, side, amountValue, counterAccount })),
    [
      { id: "AP-01", side: "haben", amountValue: 4200, counterAccount: "Maschinen" },
      { id: "AP-02", side: "soll", amountValue: 1500, counterAccount: "Forderungen LL" },
      { id: "GE-01-0", side: "haben", amountValue: 800, counterAccount: "Materialaufwand" },
    ],
  );
});

test("getAccountLedgerItems skips noBooking tasks and keeps scenario text", () => {
  const items = getAccountLedgerItems(sampleTasks, "Bank");
  assert.ok(items.every((item) => item.scenario.length > 0));
  assert.ok(!items.some((item) => item.taskId === "AP-03"));
});

test("parseAmount reads Swiss formatted amounts and plain user input", () => {
  assert.equal(parseAmount("CHF 4'200.00"), 4200);
  assert.equal(parseAmount("13'669.00"), 13669);
  assert.equal(parseAmount("13669"), 13669);
  assert.equal(parseAmount(""), 0);
  assert.equal(parseAmount("abc"), 0);
});

test("formatSwissAmount renders apostrophe thousand separators", () => {
  assert.equal(formatSwissAmount(42), "42.00");
  assert.equal(formatSwissAmount(13669), "13'669.00");
  assert.equal(formatSwissAmount(1234567.5), "1'234'567.50");
});

test("evaluateLedgerClosing computes saldo, kontrollsumme, and placement score", () => {
  const items = getAccountLedgerItems(sampleTasks, "Bank");
  const placements = { "AP-01": "haben", "AP-02": "soll", "GE-01-0": "soll" };
  const result = evaluateLedgerClosing(items, placements, {
    saldo: "3'500.00",
    saldoSide: "haben",
    kontrollsumme: "5'000.00",
  });

  assert.equal(result.correctSollTotal, 1500);
  assert.equal(result.correctHabenTotal, 5000);
  assert.equal(result.correctSaldo, 3500);
  assert.equal(result.correctSaldoSide, "soll");
  assert.equal(result.correctKS, 5000);
  assert.equal(result.placementScore, 2);
  assert.equal(result.userSaldoOk, true);
  assert.equal(result.userSaldoSideOk, false);
  assert.equal(result.userKsOk, true);
});

test("evaluateLedgerClosing puts the saldo on the smaller side", () => {
  const items = [
    { id: "a", side: "soll", amountValue: 100 },
    { id: "b", side: "haben", amountValue: 30 },
  ];
  const result = evaluateLedgerClosing(items, { a: "soll", b: "haben" }, {
    saldo: "70",
    saldoSide: "haben",
    kontrollsumme: "100",
  });

  assert.equal(result.correctSaldoSide, "haben");
  assert.equal(result.userSaldoOk, true);
  assert.equal(result.userSaldoSideOk, true);
  assert.equal(result.userKsOk, true);
  assert.equal(result.placementScore, 2);
});
