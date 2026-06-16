from __future__ import annotations

import json
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from llm.ollama_tutor import OllamaTutor, OllamaTutorError


ROOT_DIR = Path(__file__).resolve().parent
ALLOWED_ORIGINS = {
    "http://127.0.0.1:4173",
    "http://localhost:4173",
}


class TutorRequestHandler(BaseHTTPRequestHandler):
    tutor = OllamaTutor(
        prompt_path=ROOT_DIR / "llm" / "system_prompt.md",
        grading_prompt_path=ROOT_DIR / "llm" / "grading_prompt.md",
        base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
        model=os.getenv("OLLAMA_MODEL", "llama3.2:3b"),
        timeout=float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "90")),
    )

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_common_headers()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/tutor/health":
            self._write_json(HTTPStatus.OK, self.tutor.health())
            return
        self._write_json(HTTPStatus.NOT_FOUND, {"error": "Unbekannter Endpunkt."})

    def do_POST(self) -> None:
        if self.path == "/api/tutor/chat":
            self._handle_chat()
            return
        if self.path == "/api/tutor/check":
            self._handle_check()
            return
        self._write_json(HTTPStatus.NOT_FOUND, {"error": "Unbekannter Endpunkt."})

    def _handle_chat(self) -> None:
        try:
            payload = self._read_json_body(max_bytes=128_000)
            answer = self.tutor.reply(
                messages=payload.get("messages", []),
                game_context=payload.get("game_context", {}),
            )
            self._write_json(HTTPStatus.OK, {"answer": answer})
        except ValueError as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
        except OllamaTutorError as exc:
            self._write_json(
                HTTPStatus.BAD_GATEWAY,
                {
                    "error": str(exc),
                    "hint": "Starte Ollama und installiere das konfigurierte Modell.",
                },
            )

    def _handle_check(self) -> None:
        try:
            payload = self._read_json_body(max_bytes=32_000)
            feedback = self.tutor.check_justification(
                statement=payload.get("statement", ""),
                correct_answer=payload.get("correct_answer", ""),
                user_answer=payload.get("user_answer", ""),
                answer_correct=bool(payload.get("answer_correct", False)),
                justification=payload.get("justification", ""),
            )
            self._write_json(HTTPStatus.OK, {"feedback": feedback})
        except ValueError as exc:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
        except OllamaTutorError as exc:
            self._write_json(
                HTTPStatus.BAD_GATEWAY,
                {
                    "error": str(exc),
                    "hint": "Starte Ollama und installiere das konfigurierte Modell.",
                },
            )

    def _read_json_body(self, *, max_bytes: int) -> dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            raise ValueError("Request Body ist leer.")
        if content_length > max_bytes:
            raise ValueError("Request Body ist zu gross.")

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("Request Body muss gueltiges JSON sein.") from exc
        if not isinstance(payload, dict):
            raise ValueError("Request Body muss ein JSON-Objekt sein.")
        return payload

    def _write_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_common_headers()
        self.end_headers()
        self.wfile.write(body)

    def _send_common_headers(self) -> None:
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def log_message(self, format: str, *args: Any) -> None:
        return


def main() -> None:
    host = os.getenv("TUTOR_HOST", "127.0.0.1")
    port = int(os.getenv("TUTOR_PORT", "8766"))
    server = ThreadingHTTPServer((host, port), TutorRequestHandler)
    print(f"FinanceGame KI-Tutor laeuft auf http://{host}:{port}")
    print(f"Ollama: {TutorRequestHandler.tutor.model} unter {TutorRequestHandler.tutor.base_url}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
