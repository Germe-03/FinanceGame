import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const TEST_PORT = 4180;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

test("static server serves the app shell and every referenced resource", { timeout: 10000 }, async () => {
  const server = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(server);

    // App-Shell
    const html = await fetchText("/");
    assert.match(html, /<h1>FinanceGame<\/h1>/);
    assert.match(html, /id="app"/);

    // Alle in index.html referenzierten Stylesheets und Scripts sind erreichbar.
    const stylesheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(stylesheets.length > 0, "index.html must reference at least one stylesheet");
    for (const href of stylesheets) {
      await assertServed(href, /text\/css/);
    }

    const scripts = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(scripts.length, 1, "index.html must reference exactly one entry module");
    const entrySource = await fetchText(scripts[0]);

    // Alle relativen Imports des Einstiegsmoduls sind erreichbar (eine Ebene tief).
    const entryImports = [...entrySource.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1]);
    assert.ok(entryImports.length > 0, "entry module must import screens and components");
    for (const specifier of entryImports) {
      await assertServed(new URL(specifier, `${BASE_URL}/src/ui/`).pathname, /text\/javascript/);
    }

    // Spielinhalte: eine strukturierte JSON-Datei pro Aufgabe.
    for (const file of ["kontenplan", "buchungssaetze", "rechnungen", "t-konto", "mwst", "finanzthemen", "konto"]) {
      await assertServed(`/src/content/tasks/${file}.json`, /application\/json/);
    }
    const finanzthemen = JSON.parse(await fetchText("/src/content/tasks/finanzthemen.json"));
    assert.ok(Array.isArray(finanzthemen.topics) && finanzthemen.topics.length === 21, "finanzthemen.json must list 21 topics");
    const kontenplan = JSON.parse(await fetchText("/src/content/tasks/kontenplan.json"));
    assert.ok(kontenplan.title && Array.isArray(kontenplan.tasks) && kontenplan.tasks.length > 0);
    const buchungssaetze = JSON.parse(await fetchText("/src/content/tasks/buchungssaetze.json"));
    assert.ok(buchungssaetze.balanceOnly.tasks.length > 0 && buchungssaetze.mixed.tasks.length > 0);
    const mwst = JSON.parse(await fetchText("/src/content/tasks/mwst.json"));
    for (const section of ["classification", "bookingsBasic", "vorsteuerSplit", "bookingsAdvanced"]) {
      assert.ok(Array.isArray(mwst[section].tasks) && mwst[section].tasks.length > 0, `mwst.json must contain section ${section}`);
    }

    // Referenzmaterial und Assets
    await assertServed("/assets/legal/or/or.pdf", /application\/pdf/);
    await assertServed("/assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf", /application\/pdf/);
    await assertServed("/assets/accounting/rechnungen/README.md", /text\/markdown/);
    await assertServed("/lernmodule/bilanz.md", /text\/markdown/);
  } finally {
    server.kill();
  }
});

async function assertServed(path, contentTypePattern) {
  const cleanPath = path.replace(/^\.\//, "/").split("?")[0];
  const response = await fetch(`${BASE_URL}${cleanPath}`);
  assert.equal(response.status, 200, `expected 200 for ${cleanPath}`);
  assert.match(response.headers.get("content-type") ?? "", contentTypePattern, `content type for ${cleanPath}`);
  await response.arrayBuffer();
}

async function fetchText(path) {
  const cleanPath = path.replace(/^\.\//, "/").split("?")[0];
  const response = await fetch(`${BASE_URL}${cleanPath}`);
  assert.equal(response.status, 200, `expected 200 for ${cleanPath}`);
  return response.text();
}

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
