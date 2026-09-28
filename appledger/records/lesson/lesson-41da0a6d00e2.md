---
format_version: 0.1.0
id: lesson-41da0a6d00e2
kind: lesson
title: "pnpm dev overlay: An impossible situation occurred. +page imported
  row-detail, w"
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
  problem: "pnpm dev overlay: An impossible situation occurred. +page imported
    row-detail, which imported $lib/server/firewall/names. Kit forbids
    $lib/server in the browser and throws that instead of the usual leak warning
    when the import chain does not match an entrypoint."
  resolution: Keep bind helpers in $lib/binds.ts. Dashboard client must not import
    $lib/server at runtime.
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


