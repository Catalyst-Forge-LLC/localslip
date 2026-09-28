---
format_version: 0.1.0
id: decision-d108cb27a194
kind: decision
title: "Named leases can start/stop a stored recipe (default pnpm serve) via
  localberth "
record_status: active
created_at: 2026-08-24T00:00:00Z
updated_at: 2026-08-24T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: Named leases can start/stop a stored recipe (default pnpm serve) via
    localberth start|stop and the LocalHelm Ports plugin. Detached process tree;
    stop does not release the lease. Observed-only rows stay read-only. Recipe
    is cwd + command on the lease row.
  rationale: Imported from workflow tracking. Verification was not recorded.
  alternatives: []
  authority: import
---


