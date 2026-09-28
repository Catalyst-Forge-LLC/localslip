---
format_version: 0.1.0
id: lesson-9ec8d0ec0249
kind: lesson
title: Windows netstat -ano -p TCP does not list IPv6. Vite default host
  localhost bind
record_status: active
created_at: 2026-08-19T00:00:00Z
updated_at: 2026-08-19T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  context: Imported from workflow tracking gotchas[].
  problem: Windows netstat -ano -p TCP does not list IPv6. Vite default host
    localhost binds [::1] only; the lease on 127.0.0.1 looked dead while
    http://localhost:6173/ worked.
  resolution: Scan TCPv6 too. bindsOverlap treats 127.0.0.1 and ::1 as the same
    slip. Peek and the open icon try [::1] when IPv4 is silent.
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


