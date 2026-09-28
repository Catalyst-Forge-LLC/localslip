---
format_version: 0.1.0
id: decision-6f19efe5997d
kind: decision
title: "Firewall hardening: skip inbound for loopback binds; Windows/Linux only
  create o"
record_status: active
created_at: 2026-08-18T00:00:00Z
updated_at: 2026-08-18T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "Firewall hardening: skip inbound for loopback binds; Windows/Linux only
    create or delete rules named LocalBerth <name> <port> (ufw by comment,
    firewalld rich rules). macOS writes a pf anchor file and loads anchor
    localberth."
  rationale: Imported from workflow tracking. Verification was not recorded.
  alternatives: []
  authority: import
---


