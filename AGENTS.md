# Repository Guidelines
- **常に日本語で回答する**

## Project Structure & Module Organization
- `src/parking_notifier/` — application code (pollers, notifiers, scheduling, config).
- `tests/` — unit/integration tests mirroring `src` layout.
- `scripts/` — developer utilities (e.g., seed data, local runners).
- `configs/` — sample configs; include `env/.env.example` for required vars.
- `docs/` — architecture notes, API references, runbooks.

## Build, Test, and Development Commands
- `make setup` — create venv and install deps.
- `make run` — start the notifier locally (uses `.env`).
- `make test` — run tests with coverage.
- `make lint` — static checks (ruff/mypy) and formatting (black) in check mode.
- `make format` — auto-format code.
If `make` isn’t available, run the equivalent via your tool (e.g., `uv/poetry/pipx`).

## Coding Style & Naming Conventions
- Python 3.11+, 4‑space indent, PEP 8, prefer type hints everywhere.
- Names: modules/functions `snake_case`; classes `PascalCase`; constants `UPPER_SNAKE_CASE`.
- Use `ruff` for linting, `black` for formatting, `mypy` for typing. Keep CI green locally.

## Testing Guidelines
- Framework: `pytest` with `tests/` mirroring `src/` and files `test_*.py`.
- Aim for ≥80% coverage on changed lines; include edge cases and failure paths.
- Use fixtures for API stubs; avoid hitting real services in tests.
- Run locally: `make test` (or `pytest -q`).

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Commits should be small and focused; include rationale in body when non-obvious.
- PRs: clear description, linked issues, screenshots/logs when UI/behavior changes, and notes on testing and risk.

## Security & Configuration Tips
- Never commit secrets. Add required variables to `env/.env.example` with safe defaults.
- Handle provider rate limits/backoff; redact PII in logs.
- Validate external payloads; time-box network calls and handle retries idempotently.

## Architecture Overview (brief)
- Components typically include: source pollers (parking APIs), rule engine, notifiers (email/webhook/Slack), and a scheduler. Keep modules cohesive and decoupled via interfaces.

## Agent-Specific Instructions
- Keep changes minimal and targeted; don’t alter unrelated files.
- Prefer `rg` for search; read files in ≤250-line chunks.
- Update docs/tests when changing behavior; propose new `make` targets when useful.
