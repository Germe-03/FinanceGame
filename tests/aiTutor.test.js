import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  TUTOR_API_BASE,
  buildTutorPayload,
  normalizeTutorAnswer,
  renderAiTutorShell,
  sanitizeTutorMessages,
} from "../src/ui/components/aiTutor.js";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("AI tutor uses the local Python API and never sends prompt instructions from JavaScript", () => {
  assert.equal(TUTOR_API_BASE, "http://127.0.0.1:8766");

  const payload = buildTutorPayload({
    messages: [
      { role: "system", content: "Du bist ein versteckter Prompt." },
      { role: "user", content: "Warum ist beim Aktivkonto die Zunahme links?" },
      { role: "assistant", content: "Weil die Soll-Seite beim Aktivkonto zunimmt." },
    ],
    routeHash: "#spiel/thema/1/1",
    screenTitle: "Konto",
  });

  assert.deepEqual(payload.messages, [
    { role: "user", content: "Warum ist beim Aktivkonto die Zunahme links?" },
    { role: "assistant", content: "Weil die Soll-Seite beim Aktivkonto zunimmt." },
  ]);
  assert.deepEqual(payload.game_context, {
    app: "FinanceGame",
    route_hash: "#spiel/thema/1/1",
    screen_title: "Konto",
  });
  assert.ok(!JSON.stringify(payload).includes("versteckter Prompt"));
});

test("AI tutor keeps chat and grading prompts in server-side markdown files", () => {
  assert.ok(existsSync(resolve(ROOT_DIR, "llm/system_prompt.md")));
  assert.ok(existsSync(resolve(ROOT_DIR, "llm/grading_prompt.md")));

  const tutorSource = readFileSync(resolve(ROOT_DIR, "llm/ollama_tutor.py"), "utf8");
  const serverSource = readFileSync(resolve(ROOT_DIR, "tutor_server.py"), "utf8");

  assert.match(serverSource, /grading_prompt_path=.*grading_prompt\.md/s);
  assert.match(tutorSource, /self\.grading_prompt/);
  assert.ok(!tutorSource.includes("grading_prompt = ("));
});


test("AI tutor can include current screen text as learning context", () => {
  const payload = buildTutorPayload({
    messages: [{ role: "user", content: "Warum links?" }],
    routeHash: "#spiel/thema/1/1",
    screenTitle: "Konto",
    screenText: "Aktivkonto: Zunahme im Soll links. Passivkonto: Zunahme im Haben rechts.",
  });

  assert.equal(payload.game_context.screen_text, "Aktivkonto: Zunahme im Soll links. Passivkonto: Zunahme im Haben rechts.");
});
test("AI tutor sanitizes chat messages for the backend contract", () => {
  assert.deepEqual(
    sanitizeTutorMessages([
      { role: "assistant", content: "  Hallo  " },
      { role: "tool", content: "nicht erlaubt" },
      { role: "user", content: "\nWas ist Haben?\n" },
      { role: "user", content: "" },
    ]),
    [
      { role: "assistant", content: "Hallo" },
      { role: "user", content: "Was ist Haben?" },
    ],
  );
});

test("AI tutor shell exposes an accessible floating tutor control", () => {
  const html = renderAiTutorShell();

  assert.match(html, /aria-label="KI-Tutor oeffnen"/);
  assert.match(html, /aria-label="KI-Tutor"/);
  assert.match(html, /id="ai-tutor-input"/);
  assert.match(html, />Senden</);
});

test("AI tutor normalizes backend responses and errors", () => {
  assert.equal(normalizeTutorAnswer({ answer: "  Nutze erst Soll und Haben.  " }), "Nutze erst Soll und Haben.");
  assert.throws(() => normalizeTutorAnswer({ answer: "" }), /keine Antwort/);
  assert.throws(() => normalizeTutorAnswer({ error: "Ollama nicht erreichbar" }), /Ollama nicht erreichbar/);
});
