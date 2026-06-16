import test from "node:test";
import assert from "node:assert/strict";

import konto from "../src/content/tasks/konto.json" with { type: "json" };

test("konto exercise defines an asset and a liability account", () => {
  const keys = konto.accounts.map((account) => account.key);
  assert.deepEqual(keys, ["aktiv", "passiv"]);
});

test("Soll is always left and Haben always right on both accounts", () => {
  for (const account of konto.accounts) {
    assert.equal(account.slots.headerLeft, "Soll");
    assert.equal(account.slots.headerRight, "Haben");
  }
});

test("increase and decrease sit on opposite sides for asset vs liability accounts", () => {
  const aktiv = konto.accounts.find((account) => account.key === "aktiv");
  const passiv = konto.accounts.find((account) => account.key === "passiv");

  // Aktivkonto: Zunahme im Soll (links), Abnahme im Haben (rechts).
  assert.equal(aktiv.slots.valueLeft, "+");
  assert.notEqual(aktiv.slots.valueLeft, aktiv.slots.valueRight);

  // Passivkonto spiegelt das Aktivkonto bei +/−.
  assert.equal(passiv.slots.valueLeft, aktiv.slots.valueRight);
  assert.equal(passiv.slots.valueRight, aktiv.slots.valueLeft);
});
