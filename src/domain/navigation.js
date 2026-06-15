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

// Themen der Inhaltsübersicht teilen sich eine dynamische Route
// (spiel/thema/<nr>), damit nicht jede der 21 Aufgaben eine eigene
// Konstante braucht.
export const TOPIC_ROUTE_PREFIX = "spiel/thema/";

export function topicRoute(nr) {
  return `${TOPIC_ROUTE_PREFIX}${nr}`;
}

export function subtaskRoute(nr, subNr) {
  return `${TOPIC_ROUTE_PREFIX}${nr}/${subNr}`;
}

export function isTopicRoute(route) {
  return String(route ?? "").startsWith(TOPIC_ROUTE_PREFIX);
}

// Liefert { nr, subNr } für spiel/thema/<nr> bzw. spiel/thema/<nr>/<subNr>.
// subNr ist null, wenn keine Unteraufgabe adressiert ist; null gesamthaft,
// wenn die Route keine gültige Themen-Nummer enthält.
export function parseTopicRoute(route) {
  if (!isTopicRoute(route)) return null;
  const [nrPart, subPart] = route.slice(TOPIC_ROUTE_PREFIX.length).split("/");
  const nr = Number(nrPart);
  if (!Number.isInteger(nr) || nr <= 0) return null;
  if (subPart === undefined) return { nr, subNr: null };
  const subNr = Number(subPart);
  if (!Number.isInteger(subNr) || subNr <= 0) return null;
  return { nr, subNr };
}

export function routeFromHash(hash) {
  const route = String(hash ?? "").replace(/^#/, "");
  if (isTopicRoute(route)) return route;
  return knownRoutes.has(route) ? route : ROUTES.description;
}

export function hashForRoute(route) {
  if (isTopicRoute(route)) return `#${route}`;
  return ROUTE_HASHES[route] ?? ROUTE_HASHES[ROUTES.description];
}