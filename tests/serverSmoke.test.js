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
    assert.match(html, /src="\.\/src\/ui\/app\.js"/);

    const appModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/ui/app.js`);
    assert.match(appModule, /renderDescriptionScreen/);
    assert.match(appModule, /renderCaseScreen/);
    assert.match(appModule, /renderConfigurationScreen/);
    assert.match(appModule, /renderGameScreen/);
    assert.match(appModule, /renderBookingTaskScreen/);
    assert.match(appModule, /renderIncomeStatementIntroScreen/);
    assert.match(appModule, /renderMixedBookingTaskScreen/);
    assert.match(appModule, /Einstellungen übernehmen/);
    assert.match(appModule, /difficulty-button/);
    assert.match(appModule, /difficulty-help-button/);
    assert.match(appModule, /hashchange/);

    const navigationModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/domain/navigation.js`);
    assert.match(navigationModule, /#beschreibung/);
    assert.match(navigationModule, /#fall/);
    assert.match(navigationModule, /#spielkonfiguration/);
    assert.match(navigationModule, /#spiel/);
    assert.match(navigationModule, /#spiel\/aktiv-passiv/);
    assert.match(navigationModule, /#spiel\/aufwand-ertrag/);
    assert.match(navigationModule, /#spiel\/gemischt/);

    const gameContentModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/content/gameRound.js`);
    assert.match(gameContentModule, /Schweizer-Kontenrahmen-KMU\.pdf/);
    assert.match(gameContentModule, /\.\/assets\/legal\/or\/or\.pdf/);
    assert.match(gameContentModule, /KI-Buddy/);
    assert.match(gameContentModule, /balanceOnlyTasks/);
    assert.match(gameContentModule, /mixedTasks/);
    assert.match(gameContentModule, /Aufwand und Ertrag/);

    const configurationContentModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/content/gameConfiguration.js`);
    assert.match(configurationContentModule, /Beginner/);
    assert.match(configurationContentModule, /Fortgeschritten/);
    assert.match(configurationContentModule, /Experte/);
    assert.match(configurationContentModule, /Aktiv- und Passivbuchungen/);

    const domainModule = await fetchText(`http://127.0.0.1:${TEST_PORT}/src/domain/configuration.js`);
    assert.match(domainModule, /Benutzerdefiniert/);
    assert.match(domainModule, /setConfigurationDifficulty/);

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