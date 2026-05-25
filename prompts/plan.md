Create a short plan for today from the available evidence.

When `evidence.vault_snapshots` is available, treat it as yesterday's activity snapshot. When `evidence.vault_markdown` is available, use it as stable vault knowledge for priorities, context, and open loops.

Required output structure:

Today's Plan — {date}

Top Three:
1. The most important work item.
2. A secondary work or life item.
3. A third item only if it is useful.

Scheduled:
- Time-bound events from available calendars or snapshots.

Follow-ups:
- Open loops from memory, tasks, or prior review.

Missing Sources:
- Only list sources whose `evidence.source_status` state is `missing` or `error`.
- Do not list disabled sources.
- Do not list empty-but-successful sources as missing.
- Do not copy missing-source claims from Discord history or prior agent messages.

Needs User:
- Specific confirmation or edits needed to finalize the plan.
