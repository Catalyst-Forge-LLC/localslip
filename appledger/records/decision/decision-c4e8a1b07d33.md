---
format_version: 0.1.0
id: decision-c4e8a1b07d33
kind: decision
title: /s/<name> on the dashboard redirects to that lease
record_status: active
created_at: 2026-10-04T21:30:00Z
updated_at: 2026-10-04T21:30:00Z
recorded_by:
  id: cursor-agent
  type: agent
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "localslip serve answers GET /s/<name> with a 302 to
    http://<request-host>:<lease-port>/<rest>. A missing lease, a quiet port,
    or a loopback listener seen from a non-loopback host returns an HTML page.
    LocalHelm /s/<name> proxies that response from 127.0.0.1:54321 and shows
    its own page when LocalSlip is down. This is a redirect, not a proxy of
    the app."
  rationale: A stable name on the dashboard port should open the slip without
    a second registry or a reverse proxy.
  alternatives: []
  authority: operator
---
