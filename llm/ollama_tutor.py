from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from urllib import error, request


class OllamaTutorError(RuntimeError):
    """Raised when the local Ollama service cannot answer a tutor request."""


class OllamaTutor:
    def __init__(self, *, prompt_path: Path, base_url: str, model: str, timeout: float) -> None:
        self.prompt_path = prompt_path
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout
        self.system_prompt = prompt_path.read_text(encoding="utf-8").strip()

    def health(self) -> dict[str, Any]:
        try:
            payload = self._get_json("/api/tags")
        except OllamaTutorError as exc:
            return {
                "ok": False,
                "model": self.model,
                "base_url": self.base_url,
                "error": str(exc),
            }

        installed_models = [
            item.get("name")
            for item in payload.get("models", [])
            if isinstance(item, dict) and item.get("name")
        ]
        return {
            "ok": self.model in installed_models,
            "model": self.model,
            "base_url": self.base_url,
            "installed_models": installed_models,
        }

    def reply(self, *, messages: list[dict[str, Any]], game_context: dict[str, Any] | None = None) -> str:
        chat_messages = self._build_messages(messages, game_context or {})
        payload = {
            "model": self.model,
            "messages": chat_messages,
            "stream": False,
            "options": {
                "temperature": 0.35,
                "num_ctx": 4096,
            },
        }
        response_payload = self._post_json("/api/chat", payload)
        answer = response_payload.get("message", {}).get("content")

        if not isinstance(answer, str) or not answer.strip():
            raise OllamaTutorError("Ollama hat keine Antwort geliefert.")

        return answer.strip()

    def _build_messages(self, messages: list[dict[str, Any]], game_context: dict[str, Any]) -> list[dict[str, str]]:
        if not isinstance(messages, list) or not messages:
            raise ValueError("messages muss eine nicht-leere Liste sein.")

        chat_messages = [{"role": "system", "content": self.system_prompt}]
        if game_context:
            chat_messages.append(
                {
                    "role": "system",
                    "content": "Aktueller Spielkontext:\n" + json.dumps(game_context, ensure_ascii=False, indent=2),
                }
            )

        for item in messages[-14:]:
            if not isinstance(item, dict):
                continue
            role = item.get("role")
            content = item.get("content")
            if role not in {"user", "assistant"} or not isinstance(content, str):
                continue
            cleaned_content = content.strip()
            if cleaned_content:
                chat_messages.append({"role": role, "content": cleaned_content[:4000]})

        if len(chat_messages) <= 1:
            raise ValueError("messages enthaelt keine gueltige Nutzerfrage.")

        return chat_messages

    def _get_json(self, path: str) -> dict[str, Any]:
        endpoint = self.base_url + path
        try:
            with request.urlopen(endpoint, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except (OSError, error.URLError, json.JSONDecodeError) as exc:
            raise OllamaTutorError(f"Ollama ist unter {endpoint} nicht erreichbar.") from exc

    def _post_json(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        endpoint = self.base_url + path
        body = json.dumps(payload).encode("utf-8")
        request_obj = request.Request(
            endpoint,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(request_obj, timeout=self.timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            raise OllamaTutorError(f"Ollama hat die Anfrage fuer {self.model} abgelehnt: {details}") from exc
        except (OSError, error.URLError, json.JSONDecodeError) as exc:
            raise OllamaTutorError(f"Ollama ist unter {endpoint} nicht erreichbar.") from exc
