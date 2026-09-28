---
format_version: 0.1.0
id: lesson-bb1aa6111ce3
kind: lesson
title: "pnpm publish prepublishOnly (tsc -p tsconfig.cli.json) failed:
  copy-text.ts uses"
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
  problem: "pnpm publish prepublishOnly (tsc -p tsconfig.cli.json) failed:
    copy-text.ts uses document/navigator. CLI include is src/lib/**/*.ts with no
    DOM lib."
  resolution: Exclude src/lib/copy-text.ts from tsconfig.cli.json. Do not add DOM
    to the CLI lib.
  limits: Imported as a historical assertion. Verification was not recorded.
  generalization_status: observed
---


