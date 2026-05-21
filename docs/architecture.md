# Architecture

Moss Marten separates runtime code from personal configuration and personal data.

## Layers

1. Runtime
   - starts the process
   - loads configuration
   - initializes Discord and storage
   - schedules workflows

2. Workflow engine
   - runs `daily_review`
   - runs `daily_plan`
   - collects evidence
   - calls the LLM adapter
   - stores outputs

3. Channel adapter
   - Discord is the first supported channel
   - future adapters can support Slack, Telegram, or other chat systems

4. Data source adapters
   - Discord history
   - GitHub assigned issues
   - local JSON snapshots
   - note gateways

5. Memory and storage
   - SQLite stores workflow run records
   - markdown files store long-term and daily memory

## Personal Data Boundary

The repository contains only generic templates. Runtime data belongs under `data/` and must not be committed.
