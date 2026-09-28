---
format_version: 0.1.0
id: decision-ac7acee0338c
kind: decision
title: Observed rows carry command line, executable, parent process, start time,
  and cw
record_status: active
created_at: 2026-08-31T00:00:00Z
updated_at: 2026-08-31T00:00:00Z
recorded_by:
  id: migration-import
  type: import
visibility: internal
relations: []
claims: []
data:
  status: accepted
  choice: "Observed rows carry command line, executable, parent process, start
    time, and cwd when the OS gives them. Expand panel and /api/board show them.
    scan TSV stays compact. Windows: CIM (no cwd). Linux: /proc including start
    from stat+btime. macOS: ps command/lstart + lsof cwd,txt. Command-line path
    is the exe fallback. Table columns stay name/pid only."
  rationale: Imported from workflow tracking. Verification was not recorded.
  alternatives: []
  authority: import
---


