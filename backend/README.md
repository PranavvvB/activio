# Activio backend

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` to a key created in
[Google AI Studio](https://aistudio.google.com/apikey). The key is used only by
the FastAPI backend; do not expose it to the frontend or commit `.env`.

Run the API from this directory with `uvicorn app.main:app --reload`.
The profile parser calls Google's Generative Language REST API and validates
the returned JSON against the existing `ProfileParseResponse` schema.

## Connections and messaging

Authenticated users can request a connection with `POST /api/connections`
(`{"recipient_id": <user id>}`). The recipient accepts or rejects with
`PATCH /api/connections/{id}` and `{"status": "accepted"}` (or `"rejected"`),
or the convenience `/accept` and `/reject` endpoints. Messages can only be
sent or listed after acceptance using `/api/connections/{id}/messages`.
Apply the schema with `alembic upgrade head` before running the API.
