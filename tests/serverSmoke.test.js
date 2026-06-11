import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const TEST_PORT = 4180;

test("static server serves the intro app, game shell, and reference assets", { timeout: 8000 }, async () => {
  const server = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(server);

    const html = await fetchText(`http://127.0.0.1:${TEST_PORT}/`);
    assert.match(html, /<h1>FinanceGame<\/h1>/);
    assert.match(html, /id="app"/);
    assert.match(html, /src="\.\/src\/ui\/app\.js\?v=[^\"]+"/);

    const appModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/ui/app.js`);
    assert.match(appModule, /renderDescriptionScreen/);
    assert.match(appModule, /renderCaseScreen/);
    assert.match(appModule, /renderConfigurationScreen/);
    assert.match(appModule, /renderAccountPlanSearchScreen/);
    assert.match(appModule, /renderBookingTaskScreen/);
    assert.match(appModule, /renderIncomeStatementIntroScreen/);
    assert.match(appModule, /renderMixedBookingTaskScreen/);
    assert.match(appModule, /renderInvoiceBookingScreen/);
    assert.match(appModule, /route === ROUTES\.game \|\| route === ROUTES\.gameAccountPlan/);
    assert.match(appModule, /route === ROUTES\.gameBalance/);
    assert.match(appModule, /route === ROUTES\.gameInvoices/);
    assert.match(appModule, /account-choice-button/);
    assert.doesNotMatch(appModule, /shuffleAccountChoices/);
    assert.match(appModule, /booking-task-card/);
    assert.match(appModule, /invoice-task-image/);
    assert.match(appModule, /support-modal-overlay/);
    assert.match(appModule, /gameRound\.referenceActions\.map\(renderReferenceAction\)/);
    assert.match(appModule, /data-support-popup="\$\{escapeHtml\(action\.id\)\}"/);
    assert.match(appModule, /data-support-popup="calculator"/);
    assert.match(appModule, /calculator-display/);
    assert.match(appModule, /calculator-copy-button/);
    assert.match(appModule, /navigator\.clipboard\.writeText/);
    assert.match(appModule, /support-resource-link[\s\S]*href="\$\{escapeHtml\(action\.href\)\}"/);
    assert.match(appModule, /support-resource-link[\s\S]*target="_blank"/);
    assert.match(appModule, /support-resource-link[\s\S]*rel="noopener noreferrer"/);
    assert.match(appModule, /window\.open\(resourceUrl, "_blank"\)/);
    assert.doesNotMatch(appModule, /window\.location\.assign\(resourceUrl\)/);
    assert.doesNotMatch(appModule, /window\.open\("about:blank", "_blank"\)/);
    assert.match(appModule, /import \{ searchLearningModules \} from "\.\.\/domain\/learningModules\.js";/);
    assert.match(appModule, /searchLearningModules/);
    assert.match(appModule, /let learningModuleSearchQuery = "";/);
    assert.match(appModule, /initLearningModuleSearch\(\);/);
    assert.match(appModule, /data-learning-module-search/);
    assert.match(appModule, /data-learning-module-results/);
    assert.match(appModule, /lernmodule-search-status/);
    assert.match(appModule, /hashchange/);
    assert.ok(appModule.indexOf("const accountTypeLabels") < appModule.indexOf("startApp();"), "app starts after UI constants are initialized");

    const styles = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/ui/styles.css`);
    assert.match(styles, /\.account-choice-grid \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/, "account choice grid is fixed to two columns");
    assert.match(styles, /@media \(max-width: 680px\) \{[\s\S]*\.account-choice-grid \{[\s\S]*grid-template-columns: 1fr/, "account choices collapse to one column on narrow screens");
    assert.match(styles, /\.support-modal-overlay/);
    assert.match(styles, /\.support-popup-button/);
    assert.match(styles, /\.lernmodule-search/);
    assert.match(styles, /\.lernmodule-search-status/);
    assert.match(styles, /\.calculator-keypad/);

    const navigationModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/domain/navigation.js`);
    assert.match(navigationModule, /#beschreibung/);
    assert.match(navigationModule, /#fall/);
    assert.match(navigationModule, /#spielkonfiguration/);
    assert.match(navigationModule, /#spiel\/kontenplan/);
    assert.match(navigationModule, /#spiel\/aktiv-passiv/);
    assert.match(navigationModule, /#spiel\/aufwand-ertrag/);
    assert.match(navigationModule, /#spiel\/gemischt/);
    assert.match(navigationModule, /#spiel\/rechnungen/);

    const gameContentModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/content/gameRound.js`);
    assert.match(gameContentModule, /accountPlanSearch/);
    assert.match(gameContentModule, /bookingTask/);
    assert.match(gameContentModule, /invoiceBooking/);
    assert.match(gameContentModule, /rechnung_1\.png/);
    assert.match(gameContentModule, /rechnung_5\.png/);
    assert.match(gameContentModule, /Büromaschinen/);
    assert.match(gameContentModule, /Sonstiger Betriebsaufwand/);
    assert.match(gameContentModule, /Schweizer-Kontenrahmen-KMU\.pdf/);
    assert.match(gameContentModule, /\.\/assets\/legal\/or\/or\.pdf/);

    const configurationContentModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/content/gameConfiguration.js`);
    assert.match(configurationContentModule, /Beginner/);
    assert.match(configurationContentModule, /Fortgeschritten/);
    assert.match(configurationContentModule, /Experte/);
    assert.match(configurationContentModule, /Aktiv- und Passivbuchungen/);

    const domainModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/domain/configuration.js`);
    assert.match(domainModule, /Benutzerdefiniert/);
    assert.match(domainModule, /setConfigurationDifficulty/);

    const learningModuleSearchDomain = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/domain/learningModules.js`);
    assert.match(learningModuleSearchDomain, /searchLearningModules/);
    assert.match(learningModuleSearchDomain, /normalize\("NFD"\)/);

    const descriptionModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/content/gameDescription.js`);
    assert.match(descriptionModule, /interaktives Lernspiel/);

    const orPdf = await fetch(`http://127.0.0.1:${TEST_PORT}/assets/legal/or/or.pdf`);
    assert.equal(orPdf.status, 200);
    assert.match(orPdf.headers.get("content-type") ?? "", /application\/pdf/);

    const accountPlanPdf = await fetch(`http://127.0.0.1:${TEST_PORT}/assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf`);
    assert.equal(accountPlanPdf.status, 200);
    assert.match(accountPlanPdf.headers.get("content-type") ?? "", /application\/pdf/);

    const accountPlanReadme = await fetchText(`http://127.0.0.1:${TEST_PORT}/assets/accounting/kmu-kontenplan/README.md`);
    assert.match(accountPlanReadme, /Schweizer-Kontenrahmen-KMU\.pdf/);

    const invoiceReadme = await fetchText(`http://127.0.0.1:${TEST_PORT}/assets/accounting/rechnungen/README.md`);
    assert.match(invoiceReadme, /rechnung_1\.png/);
    assert.match(invoiceReadme, /rechnung_5\.png/);
  } finally {
    server.kill();
  }
});

async function waitForServer(server) {
  let output = "";
  server.stdout.on("data", (chunk) => {
    output += chunk.toString("utf8");
  });
  server.stderr.on("data", (chunk) => {
    output += chunk.toString("utf8");
  });

  const start = Date.now();
  while (!output.includes("FinanceGame laeuft")) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited early: ${output}`);
    }
    if (Date.now() - start > 5000) {
      throw new Error(`Server did not start: ${output}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200, url);
  return response.text();
}
