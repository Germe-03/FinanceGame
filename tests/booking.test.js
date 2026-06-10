import test from "node:test";
import assert from "node:assert/strict";

import { filterAccounts, getUniqueAccounts } from "../src/domain/booking.js";

const sampleRegistry = [
  { number: "1000", name: "Kasse" },
  { number: "1020", name: "Bank" },
  { number: "2800", name: "Eigenkapital" },
];

const sampleTasks = [
  { debit: { account: "Bank", type: "active" }, credit: { account: "Eigenkapital", type: "passive" } },
  { debit: { account: "Kasse", type: "active" }, credit: { account: "Bank", type: "active" } },
  { debit: { account: "Bank", type: "active" }, credit: { account: "Kasse", type: "active" } },
];

test("getUniqueAccounts extracts deduplicated accounts sorted by number", () => {
  const accounts = getUniqueAccounts(sampleTasks, sampleRegistry);
  assert.deepEqual(accounts, [
    { number: "1000", name: "Kasse" },
    { number: "1020", name: "Bank" },
    { number: "2800", name: "Eigenkapital" },
  ]);
});

test("getUniqueAccounts includes accounts missing from the registry with empty number", () => {
  const tasks = [
    { debit: { account: "UnbekanntesKonto", type: "active" }, credit: { account: "Bank", type: "active" } },
  ];
  const accounts = getUniqueAccounts(tasks, sampleRegistry);
  const unknown = accounts.find((a) => a.name === "UnbekanntesKonto");
  assert.ok(unknown, "unknown account must still be included");
  assert.equal(unknown.number, "");
});

test("getUniqueAccounts covers all balance-only task accounts via the game account plan", async () => {
  const { gameRound } = await import("../src/content/gameRound.js");
  const { accountPlan } = await import("../src/content/accountPlan.js");
  const accounts = getUniqueAccounts(gameRound.balanceOnlyTasks.tasks, accountPlan);
  const names = accounts.map((a) => a.name);
  assert.ok(names.includes("Bank"));
  assert.ok(names.includes("Darlehen"));
  assert.ok(names.includes("Verbindlichkeiten LL"));
  assert.ok(names.includes("Forderungen LL"));
  assert.equal(names.length, new Set(names).size, "no duplicates");
  accounts.forEach((a) => assert.ok(a.number, `${a.name} must have a number in accountPlan`));
});

test("filterAccounts returns all accounts when query is empty", () => {
  const accounts = [
    { number: "1000", name: "Kasse" },
    { number: "1020", name: "Bank" },
  ];
  assert.deepEqual(filterAccounts(accounts, ""), accounts);
  assert.deepEqual(filterAccounts(accounts, "  "), accounts);
});

test("filterAccounts filters case-insensitively by account name", () => {
  const accounts = [
    { number: "1000", name: "Kasse" },
    { number: "1020", name: "Bank" },
    { number: "1100", name: "Forderungen LL" },
  ];
  assert.deepEqual(filterAccounts(accounts, "bank"), [{ number: "1020", name: "Bank" }]);
  assert.deepEqual(filterAccounts(accounts, "KASSE"), [{ number: "1000", name: "Kasse" }]);
  assert.deepEqual(filterAccounts(accounts, "ll"), [{ number: "1100", name: "Forderungen LL" }]);
  assert.deepEqual(filterAccounts(accounts, "xyz"), []);
});

test("getUniqueAccounts handles compound tasks with multiple bookings", () => {
  const compound = {
    id: "GE-17",
    scenario: "...",
    bookings: [
      { amount: "CHF 1'800.00", debit: { account: "Materialaufwand", type: "expense" }, credit: { account: "Verbindlichkeiten LL", type: "passive" } },
      { amount: "CHF 120.00", debit: { account: "Sonstiger Betriebsaufwand", type: "expense" }, credit: { account: "Kasse", type: "active" } },
    ],
  };
  const registry = [
    { number: "1000", name: "Kasse" },
    { number: "2000", name: "Verbindlichkeiten LL" },
    { number: "4000", name: "Materialaufwand" },
    { number: "6700", name: "Sonstiger Betriebsaufwand" },
  ];
  const accounts = getUniqueAccounts([compound], registry);
  const names = accounts.map((a) => a.name);
  assert.ok(names.includes("Kasse"));
  assert.ok(names.includes("Verbindlichkeiten LL"));
  assert.ok(names.includes("Materialaufwand"));
  assert.ok(names.includes("Sonstiger Betriebsaufwand"));
  assert.equal(names.length, new Set(names).size, "no duplicates");
});

test("filterAccounts filters by account number", () => {
  const accounts = [
    { number: "1000", name: "Kasse" },
    { number: "1020", name: "Bank" },
    { number: "2800", name: "Eigenkapital" },
  ];
  assert.deepEqual(filterAccounts(accounts, "1000"), [{ number: "1000", name: "Kasse" }]);
  assert.deepEqual(filterAccounts(accounts, "28"), [{ number: "2800", name: "Eigenkapital" }]);
  assert.deepEqual(filterAccounts(accounts, "9999"), []);
});
