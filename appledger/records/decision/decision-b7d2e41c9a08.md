---
format_version: 0.1.0
id: decision-b7d2e41c9a08
kind: decision
title: Named opens use /s/<name>; the operator can open the Deck
record_status: active
created_at: 2026-10-05T03:45:00Z
updated_at: 2026-10-05T03:45:00Z
recorded_by:
  id: cursor-agent
  type: agent
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "/deck shows the visitor tiles to the operator, with a header link
    from the lease table and a Board link back. Deck tiles and the Open
    control on a named row go to /s/<name>
    on the dashboard host. Hold-to-copy copies that link. Favicons still load
    from the app's own origin. A listener with no lease still opens on the
    address that is listening. A loopback page on 127.0.0.1 follows a
    listener that is only on ::1. The bind cell shows wider, narrower, other,
    or also. A quiet deck uses the empty berth and says nothing is listening
    on this address. The port stays on the tile."
  rationale: The name URL already explains a stopped or loopback-only slip.
    The table already knew when a process bind did not match the claim.
  alternatives: []
  authority: operator
---
