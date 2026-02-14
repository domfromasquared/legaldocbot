# Legal Doc Bot

Legal document interview assistant with a web UI and Node backend.

## Current Architecture

- Frontend: static web UI in `public/`.
- Backend: Express server in `server.js`.
- Chat endpoint: `POST /api/respond` (stable), now supports plain chat and schema-driven form turns.
- Transcription endpoint: `POST /api/transcribe`.
- Form schema catalog: files in `forms/`.
- Form schema loader: `app/forms/loader.js` with in-memory mtime cache.
- Field validation and conditional rules: `app/forms/validator.js`.
- Progress and next-question selection: `app/forms/navigator.js`.
- LLM structured output contract and parsing: `app/llm/types.js`.
- LLM API wrappers: `app/llm/client.js`.

## Form Schema Format

Each schema file in `forms/` should include:

- `id`, `title`, `jurisdiction`, `version`
- `fields`: array of field definitions

Each field supports:

- `key`, `label`, `type`, `required`
- `help`, `examples`, `pattern`, `enum`
- conditional rules: `show_if`, `required_if`

Top-level validation options:

- `validation.forbid_unknown_fields` (default true)

See `forms/example_form.yaml` for a complete example.

## Add a New Form

1. Copy `forms/example_form.yaml` to `forms/<your_form_id>.yaml`.
2. Update `id` to match the filename stem.
3. Define fields, types, regex/enums, and conditional rules.
4. Restart server if running.
5. Verify catalog with `GET /api/forms`.

## API Notes

`POST /api/respond` still returns `output_text` for existing UI compatibility.

When called with form context (`form_id`, `answers`, `messages`), it also returns:

- `structured`: validated model object
- `answers`: merged validated answers
- `validation_errors`: array of field errors
- `progress`: filled/total stats
- `next_field`: metadata for next required question

## Run Tests

```bash
npm test
```
