---
format_version: 0.1.0
id: decision-63dbc069db2b
kind: decision
title: "Log tail is the last 40 lines of ~/.localberth/logs/<name>.log (empty =
  “No log "
record_status: active
created_at: 2026-08-25T00:00:00Z
updated_at: 2026-08-25T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "Log tail is the last 40 lines of ~/.localberth/logs/<name>.log (empty =
    “No log yet — start once.”). Start plan rows include host (bind) so
    LocalHelm can print PORT/HOST. localberth doctor is read-only: fail on
    missing cwd or two listeners; warn on kind=always down and pnpm serve plus a
    family -api in the same folder. Parked+listening waits for park. Exit 1 only
    on fail."
  rationale: Imported from workflow tracking. Verification was not recorded.
  alternatives: []
  authority: import
---


