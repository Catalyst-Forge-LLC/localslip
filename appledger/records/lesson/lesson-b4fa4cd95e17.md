---
format_version: 0.1.0
id: lesson-b4fa4cd95e17
kind: lesson
title: "npm i -g localberth@0.2.0 on Node 24 / npm 12: Could not locate the
  bindings fil"
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
  problem: "npm i -g localberth@0.2.0 on Node 24 / npm 12: Could not locate the
    bindings file (better-sqlite3). ignore-scripts is false; allowScripts
    default is off, so 12.x never runs prebuild-install."
  resolution: "Depend on better-sqlite3 ^13. Workaround on 0.2.0: npm i -g
    localberth --allow-scripts=better-sqlite3."
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


