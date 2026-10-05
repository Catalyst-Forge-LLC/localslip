---
format_version: 0.1.0
id: decision-87a1d942c5e0
kind: decision
title: Deck cards have space below the header
record_status: active
created_at: 2026-10-05T11:29:09Z
updated_at: 2026-10-05T11:38:07Z
recorded_by:
  id: codex
  type: agent
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: Give the served Deck 1.5rem of top padding. Add 0.5rem above the
    Svelte Deck grid to supplement BoardShell's existing 1rem top padding.
    Use the same 1.5rem gap between cards and wrapped rows in both renderers.
    Place the operator's Board or Deck view link at the top right of the header,
    separate from the machine metadata and system port toggle.
    Center the view control vertically and style it as a cyan outlined button
    with a grid icon for Deck and table icon for Board, plus hover and focus states.
  rationale: The operator requested more space between the Deck header and
    cards; both renderers now provide a 24px gap at the default font size.
  alternatives: []
  authority: operator
---
