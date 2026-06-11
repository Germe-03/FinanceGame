import test from "node:test";
import assert from "node:assert/strict";

import { ROUTES, hashForRoute, routeFromHash } from "../src/domain/navigation.js";

test("navigation maps every app step to a URL hash", () => {
  assert.equal(ROUTES.description, "beschreibung");
  assert.equal(ROUTES.case, "fall");
  assert.equal(ROUTES.configuration, "spielkonfiguration");
  assert.equal(ROUTES.game, "spiel");
  assert.equal(ROUTES.gameAccountPlan, "spiel/kontenplan");
  assert.equal(ROUTES.gameBalance, "spiel/aktiv-passiv");
  assert.equal(ROUTES.gameIncomeIntro, "spiel/aufwand-ertrag");
  assert.equal(ROUTES.gameMixed, "spiel/gemischt");
  assert.equal(ROUTES.gameInvoices, "spiel/rechnungen");

  assert.equal(hashForRoute(ROUTES.description), "#beschreibung");
  assert.equal(hashForRoute(ROUTES.case), "#fall");
  assert.equal(hashForRoute(ROUTES.configuration), "#spielkonfiguration");
  assert.equal(hashForRoute(ROUTES.game), "#spiel");
  assert.equal(hashForRoute(ROUTES.gameAccountPlan), "#spiel/kontenplan");
  assert.equal(hashForRoute(ROUTES.gameBalance), "#spiel/aktiv-passiv");
  assert.equal(hashForRoute(ROUTES.gameIncomeIntro), "#spiel/aufwand-ertrag");
  assert.equal(hashForRoute(ROUTES.gameMixed), "#spiel/gemischt");
  assert.equal(hashForRoute(ROUTES.gameInvoices), "#spiel/rechnungen");
});

test("navigation reads known hashes and falls back to the description", () => {
  assert.equal(routeFromHash("#fall"), ROUTES.case);
  assert.equal(routeFromHash("#spielkonfiguration"), ROUTES.configuration);
  assert.equal(routeFromHash("#spiel"), ROUTES.game);
  assert.equal(routeFromHash("#spiel/kontenplan"), ROUTES.gameAccountPlan);
  assert.equal(routeFromHash("#spiel/aktiv-passiv"), ROUTES.gameBalance);
  assert.equal(routeFromHash("#spiel/aufwand-ertrag"), ROUTES.gameIncomeIntro);
  assert.equal(routeFromHash("#spiel/gemischt"), ROUTES.gameMixed);
  assert.equal(routeFromHash("#spiel/rechnungen"), ROUTES.gameInvoices);
  assert.equal(routeFromHash(""), ROUTES.description);
  assert.equal(routeFromHash("#unbekannt"), ROUTES.description);
});