export const ROUTES = Object.freeze({
  description: "beschreibung",
  case: "fall",
  configuration: "spielkonfiguration",
  game: "spiel",
  gameAccountPlan: "spiel/kontenplan",
  gameBalance: "spiel/aktiv-passiv",
  gameIncomeIntro: "spiel/aufwand-ertrag",
  gameMixed: "spiel/gemischt",
  gameInvoices: "spiel/rechnungen",
});

export const ROUTE_HASHES = Object.freeze({
  [ROUTES.description]: "#beschreibung",
  [ROUTES.case]: "#fall",
  [ROUTES.configuration]: "#spielkonfiguration",
  [ROUTES.game]: "#spiel",
  [ROUTES.gameAccountPlan]: "#spiel/kontenplan",
  [ROUTES.gameBalance]: "#spiel/aktiv-passiv",
  [ROUTES.gameIncomeIntro]: "#spiel/aufwand-ertrag",
  [ROUTES.gameMixed]: "#spiel/gemischt",
  [ROUTES.gameInvoices]: "#spiel/rechnungen",
});

const knownRoutes = new Set(Object.values(ROUTES));

export function routeFromHash(hash) {
  const route = String(hash ?? "").replace(/^#/, "");
  return knownRoutes.has(route) ? route : ROUTES.description;
}

export function hashForRoute(route) {
  return ROUTE_HASHES[route] ?? ROUTE_HASHES[ROUTES.description];
}