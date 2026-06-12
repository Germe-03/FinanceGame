import test from "node:test";
import assert from "node:assert/strict";

import { summarizeProgress } from "../src/domain/taskProgress.js";

test("summarizeProgress counts completed flags and computes a rounded percent", () => {
  assert.deepEqual(summarizeProgress([true, false, true, false]), { done: 2, total: 4, percent: 50 });
  assert.deepEqual(summarizeProgress([true, true, true]), { done: 3, total: 3, percent: 100 });
  assert.deepEqual(summarizeProgress([false, false]), { done: 0, total: 2, percent: 0 });
  assert.deepEqual(summarizeProgress([true, false, false]), { done: 1, total: 3, percent: 33 });
});

test("summarizeProgress handles an empty list without dividing by zero", () => {
  assert.deepEqual(summarizeProgress([]), { done: 0, total: 0, percent: 0 });
});
