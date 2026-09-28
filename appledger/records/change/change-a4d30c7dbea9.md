---
format_version: 0.1.0
id: change-a4d30c7dbea9
kind: change
title: Unmapped tracking fields
record_status: active
created_at: 2026-08-18T00:00:00Z
updated_at: 2026-08-18T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
extensions:
  migration:
    unmapped:
      openQuestions: []
      phases.4-feature-iteration:
        iterations: []
data:
  change_type: added
  affected_ids:
    - app-221436224f7d
  reason: Fields from the tracking file that have no ledger mapping were retained.
  evidence_refs: []
  operation: reconciliation
---

The unmapped fields are in extensions.migration.unmapped.
