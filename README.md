# Moss Marten

<p align="center">
  <img src="docs/assets/moss-marten-logo-banner.png" alt="Moss Marten" width="700">
</p>

Moss Marten is a configurable daily workflow agent for personal planning and review. It runs as a small service, posts to a configured Discord channel, and helps a user keep a lightweight daily operating rhythm.

It is intentionally generic. The repository does not include personal memory, tokens, channel IDs, private notes, or historical data.

## What It Does

- Runs a daily review workflow at a configured time.
- Runs a daily planning workflow at a configured time.
- Supports manual one-shot runs from the command line.
- Supports optional Discord command triggers in the configured channel.
- Reads recent Discord channel history as context.
- Optionally reads GitHub assigned issues.
- Optionally reads local JSON snapshots for calendars and tasks.
- Stores workflow outputs in SQLite and local markdown memory.
- Marks unavailable data sources as missing instead of inventing context.

## Quick Start

```bash
git clone <repository-url>
cd moss-marten
cp .env.example .env
cp config/config.example.yaml config/config.yaml
npm install
npm run build
npm start
```

Manual triggers:

```bash
npm run run:review
npm run run:plan
npm run smoke
```

Discord triggers are configured in `triggers.discord_commands`. For example, the default template can run a review when a user posts `start review` in the configured channel.

For Docker:

```bash
cp .env.example .env
cp config/config.example.yaml config/config.yaml
docker compose up -d --build
```

## Required Configuration

Edit `.env`:

```bash
OPENAI_API_KEY=
DISCORD_BOT_TOKEN=
DISCORD_REVIEW_CHANNEL_ID=
TZ=UTC
```

Edit `config/config.yaml`:

```yaml
user:
  display_name: "User"
  timezone: "UTC"

workflows:
  daily_review:
    enabled: true
    time: "21:30"
    channel: "review"
  daily_plan:
    enabled: true
    time: "08:00"
    channel: "review"
```

## Privacy Model

Do not commit these files:

- `.env`
- `config/config.yaml`
- `data/`
- SQLite databases
- generated memory files
- snapshot files
- logs

The included `.gitignore` excludes those paths by default.

## Data Sources

All sources are optional except Discord channel access.

- `discord_history`: recent channel messages
- `github`: assigned GitHub issues, requires `GITHUB_TOKEN`
- `calendar_snapshot`: local JSON file
- `tasks_snapshot`: local JSON file
- `apple_calendar_snapshot`: local JSON calendar snapshot
- `chrome_snapshot`: local text/JSON browser snapshot
- `vault_snapshots`: dated activity snapshots under a `_snapshots` or `snapshots` directory
- `vault_markdown`: markdown notes from a local vault directory, used by daily planning
- `vault_gate`: reserved for integrations that expose notes through an HTTP gateway
- `codex_history`: local Codex session/history files

Unavailable sources are reported to the model as missing sources. Disabled sources are reported as disabled.

## Project Status

This is an MVP runtime. It is ready for local deployment and extension, but the first version keeps approval cards, multi-user support, and rich dashboards out of scope.

## License

MIT
