# Activio backend

## Setup with uv

Install [uv](https://docs.astral.sh/uv/), then run these commands from this
directory:

```bash
uv sync
cp .env.example .env
uv run alembic upgrade head
```

This creates or updates the local `.venv` and installs the locked dependency
set from `uv.lock`. The `requirements.txt` workflow is no longer used.

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` to a key created in
[Google AI Studio](https://aistudio.google.com/apikey). The key is used only by
the FastAPI backend; do not expose it to the frontend or commit `.env`.

Run the API from this directory with `uv run uvicorn app.main:app --reload`.
The profile parser calls Google's Generative Language REST API and validates
the returned JSON against the existing `ProfileParseResponse` schema.

## Connections and messaging

Authenticated users can request a connection with `POST /api/connections`
(`{"recipient_id": <user id>}`). The recipient accepts or rejects with
`PATCH /api/connections/{id}` and `{"status": "accepted"}` (or `"rejected"`),
or the convenience `/accept` and `/reject` endpoints. Messages can only be
sent or listed after acceptance using `/api/connections/{id}/messages`.
Apply the schema with `uv run alembic upgrade head` before running the API.

Run the backend tests with:

```bash
uv run pytest
```
