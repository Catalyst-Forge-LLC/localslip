---
format_version: 0.1.0
id: lesson-489a85a317de
kind: lesson
title: Vite --host (all interfaces) on Windows is a dual-stack socket. netstat
  TCPv6 re
record_status: active
created_at: 2026-08-20T00:00:00Z
updated_at: 2026-08-20T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  context: Imported from workflow tracking gotchas[].
  problem: Vite --host (all interfaces) on Windows is a dual-stack socket. netstat
    TCPv6 reports ::, which looked like a bug next to 127.0.0.1 claims.
  resolution: "displayBind maps wildcard :: / * / 0.0.0.0 to 0.0.0.0 for the table
    and Listen field. Relation is still wider vs a loopback claim."
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


