Create a daily review from the available evidence.

When `evidence.vault_snapshots` is available, treat it as today's activity snapshot for this review. When `evidence.vault_markdown` is available, use it as stable vault knowledge for context, priorities, and recurring open loops.

Required output structure:

Daily Review — {date}

Completed:
- Items supported by available evidence.

Missed / Deferred:
- Items that appear unfinished. Say "reason unknown" unless the evidence supports a reason.

Noticed:
- Patterns, risks, or noteworthy observations.

Missing Sources:
- Only list sources whose `evidence.source_status` state is `missing` or `error`.
- Do not list disabled sources.
- Do not list empty-but-successful sources as missing.
- Do not copy missing-source claims from Discord history or prior agent messages.

Needs User:
- Specific questions needed to finalize the review.
