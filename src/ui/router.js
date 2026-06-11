import { hashForRoute, routeFromHash } from "../domain/navigation.js";

let renderers = new Map();
let fallbackRenderer = () => {};

export function configureRouter(routeRenderers, fallback) {
  renderers = new Map(Object.entries(routeRenderers));
  fallbackRenderer = fallback;
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
  (renderers.get(route) ?? fallbackRenderer)();
}
