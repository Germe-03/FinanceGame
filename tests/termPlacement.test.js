import test from "node:test";
import assert from "node:assert/strict";

import { evaluateTermPlacement } from "../src/domain/termPlacement.js";

const slots = [
  { id: "a", correct: "Soll" },
  { id: "b", correct: "Haben" },
  { id: "c", correct: "+" },
];

test("evaluateTermPlacement scores a fully correct placement", () => {
  const result = evaluateTermPlacement(slots, { a: "Soll", b: "Haben", c: "+" });
  assert.equal(result.correctCount, 3);
  assert.equal(result.total, 3);
  assert.ok(result.allCorrect);
});

test("evaluateTermPlacement marks wrong and missing placements", () => {
  const result = evaluateTermPlacement(slots, { a: "Haben", c: "+" });
  assert.equal(result.correctCount, 1);
  assert.ok(!result.allCorrect);

  const byId = Object.fromEntries(result.results.map((entry) => [entry.id, entry]));
  assert.equal(byId.a.ok, false);
  assert.equal(byId.b.placed, null);
  assert.equal(byId.b.ok, false);
  assert.equal(byId.c.ok, true);
});

test("evaluateTermPlacement handles an empty slot list", () => {
  const result = evaluateTermPlacement([], {});
  assert.equal(result.total, 0);
  assert.equal(result.correctCount, 0);
  assert.ok(!result.allCorrect);
});
