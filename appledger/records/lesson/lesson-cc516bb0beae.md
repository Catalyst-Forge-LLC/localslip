---
format_version: 0.1.0
id: lesson-cc516bb0beae
kind: lesson
title: A loopback claim with Vite --host was reachable on Tailscale/Wi-Fi but
  hidden on
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
  problem: A loopback claim with Vite --host was reachable on Tailscale/Wi-Fi but
    hidden on visitor tiles, which filtered on the claim bind.
  resolution: isVisitorLease uses observed.bind (fallback lease.bind).
    Loopback-only sockets stay off the phone menu.
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


