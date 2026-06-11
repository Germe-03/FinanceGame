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
  gameTKonto: "spiel/t-konto",
  gameMwstClassify: "spiel/mwst/zuordnen",
  gameMwstBooking: "spiel/mwst/buchen",
  gameMwstVorsteuer: "spiel/mwst/vorsteuer-konten",
  gameMwstBookingPro: "spiel/mwst/buchen-vertieft",
  gameMwstTKonto: "spiel/mwst/t-konto",
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
  [ROUTES.gameTKonto]: "#spiel/t-konto",
  [ROUTES.gameMwstClassify]: "#spiel/mwst/zuordnen",
  [ROUTES.gameMwstBooking]: "#spiel/mwst/buchen",
  [ROUTES.gameMwstVorsteuer]: "#spiel/mwst/vorsteuer-konten",
  [ROUTES.gameMwstBookingPro]: "#spiel/mwst/buchen-vertieft",
  [ROUTES.gameMwstTKonto]: "#spiel/mwst/t-konto",
});

const knownRoutes = new Set(Object.values(ROUTES));

export function routeFromHash(hash) {
  const route = String(hash ?? "").replace(/^#/, "");
  return knownRoutes.has(route) ? route : ROUTES.description;
}

export function hashForRoute(route) {
  return ROUTE_HASHES[route] ?? ROUTE_HASHES[ROUTES.description];
}