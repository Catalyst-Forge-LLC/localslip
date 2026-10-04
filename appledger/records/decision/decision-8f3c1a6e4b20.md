---
format_version: 0.1.0
id: decision-8f3c1a6e4b20
kind: decision
title: localslip serve listens on 0.0.0.0. A non-loopback Host gets the visitor
  tiles
record_status: active
created_at: 2026-10-04T15:55:00Z
updated_at: 2026-10-04T15:55:00Z
recorded_by:
  id: cursor-agent
  type: agent
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "localslip serve binds 0.0.0.0 unless --host or HOST is set. The lease
    table and /api/board and /api/peek require a loopback TCP peer and a
    loopback Host. Any other Host gets the visitor tiles. The dashboard lease
    bind is 0.0.0.0; a leftover loopback row is widened. App claims stay
    loopback unless --lan."
  rationale: Tailscale could not reach a loopback socket. LocalHelm already
    listens on all interfaces and shows the Deck off loopback.
  alternatives: []
  authority: operator
---
