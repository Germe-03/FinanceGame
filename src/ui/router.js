import { hashForRoute, routeFromHash } from "../domain/navigation.js";

let renderers = new Map();
let fallbackRenderer = () => {};
let dynamicRenderers = [];

// dynamicRenderers: [{ test(route): boolean, render(route): void }] für
// parametrierte Routen (z. B. spiel/thema/<nr>), die keine feste Route haben.
export function configureRouter(routeRenderers, fallback, dynamic = []) {
  renderers = new Map(Object.entries(routeRenderers));
  fallbackRenderer = fallback;
  dynamicRenderers = dynamic;
}

export function navigateTo(route) {
  const nextHash = hashForRoute(route);
  if (window.location.hash === nextHash) {
    renderRoute(route);
    return;
  }
  window.location.hash = nextHash;
}

export function startRouter() {
  window.addEventListener("hashchange", renderCurrentRoute);
  const route = routeFromHash(window.location.hash);
  const canonicalHash = hashForRoute(route);
  if (window.location.hash !== canonicalHash) {
    window.history.replaceState(null, "", canonicalHash);
  }
  renderRoute(route);
}

function renderCurrentRoute() {
  renderRoute(routeFromHash(window.location.hash));
}

function renderRoute(route) {
  const exact = renderers.get(route);
  if (exact) {
    exact();
    return;
  }
  const dynamic = dynamicRenderers.find((matcher) => matcher.test(route));
  if (dynamic) {
    dynamic.render(route);
    return;
  }
  fallbackRenderer();
}
