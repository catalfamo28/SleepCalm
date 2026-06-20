# Outcome — eBay Stale Listing Refresher

## Rubric (all must be satisfied for the run to pass)

- [ ] **Stale listings identified** — all active listings with StartTime 90+ days ago are found; 'power cord' titles are excluded and do not appear anywhere in the output
- [ ] **Old listings ended** — every processed listing has a confirmed EndItem call with a success response before its replacement is created
- [ ] **Originals preserved** — new listings carry over all original images, item specifics, category, condition, and price unchanged
- [ ] **Titles improved** — every new title is ≤80 chars, leads with the most searchable keywords, contains no filler ('L@@K', 'WOW', ALL CAPS blocks)
- [ ] **Drip schedule respected** — all new listings use ScheduleTime; no listing goes live same-day; no more than 5 scheduled per calendar day
- [ ] **Report written** — relisting_report.md exists in outputs with: summary counts, old→new title table with scheduled go-live dates, and skipped items with reasons
