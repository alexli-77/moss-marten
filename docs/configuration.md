# Configuration

`config/config.yaml` controls the runtime.

## Assistant

```yaml
assistant:
  name: "moss-marten"
  language: "en"
  tone: "direct, calm, practical"
```

## User

```yaml
user:
  display_name: "User"
  timezone: "UTC"
```

## Workflows

```yaml
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

Times are interpreted in `user.timezone`.

## Triggers

```yaml
triggers:
  discord_commands:
    enabled: true
    channel: "review"
    daily_review_patterns:
      - "^start review$"
      - "^run review$"
    daily_plan_patterns:
      - "^today plan$"
      - "^run plan$"
```

Patterns are regular expressions matched against messages in the configured Discord channel. Bot-authored messages are ignored.

## Sources

Each data source can be enabled or disabled independently. Missing sources are passed to the LLM as missing context.

```yaml
sources:
  vault_snapshots:
    enabled: true
    root: "./data/vault/_snapshots"
    max_files: 20
  vault_markdown:
    enabled: true
    root: "./data/vault"
    max_files: 40
    max_bytes_per_file: 12000
```

`vault_snapshots` may point either at a vault root or directly at a `_snapshots`/`snapshots` directory. For `daily_review`, the runtime reads snapshots for the current workflow date. For `daily_plan`, it reads the previous day's snapshots.

`vault_markdown` reads markdown files from the configured vault root and is added to both `daily_review` and `daily_plan` evidence. It skips hidden directories, `_snapshots`, and `node_modules`.
