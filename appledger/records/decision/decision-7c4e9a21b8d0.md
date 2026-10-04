---
format_version: 0.1.0
id: decision-7c4e9a21b8d0
kind: decision
title: A claim refuses another project's listener. The firewall column uses plain words
record_status: active
created_at: 2026-10-04T20:40:00Z
updated_at: 2026-10-04T20:40:00Z
recorded_by:
  id: cursor-agent
  type: agent
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "claim --port fails when the listener's cwd or node_modules path is a
    different project than the claim directory. --force names it anyway.
    --or-next still takes a free port. Same-project re-claims stay. Stored
    firewall values stay skipped, wanted, needs-elevation, and applied. The
    board reads private, pending, needs admin, and allowed. A skipped claim
    that is not loopback reads no rule."
  rationale: A dev script could claim a preferred port another app was already
    listening on, and the Deck then showed the new lease name. skipped and
    needs-elevation did not say whether a rule was missing or simply not
    required.
  alternatives: []
  authority: operator
---
