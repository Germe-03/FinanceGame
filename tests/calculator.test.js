import test from "node:test";
import assert from "node:assert/strict";

import { calculateExpression } from "../src/domain/calculator.js";

test("calculator evaluates common finance expressions and formats cents", () => {
  assert.deepEqual(calculateExpression("565 + 134.10"), { value: 699.1, display: "699.10" });
  assert.deepEqual(calculateExpression("1'800 + 372,50"), { value: 2172.5, display: "2172.50" });
  assert.deepEqual(calculateExpression("(415 + 150) / 2"), { value: 282.5, display: "282.50" });
});

test("calculator rejects unsafe or invalid expressions", () => {
  assert.throws(() => calculateExpression("alert(1)"), /ungueltige Zeichen/i);
  assert.throws(() => calculateExpression("10 / 0"), /Division durch null/i);
  assert.throws(() => calculateExpression(""), /Rechnung ein/i);
});