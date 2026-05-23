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
