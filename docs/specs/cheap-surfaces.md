# Cheap surfaces — LocalBerth

**Spec kind:** Delivery  
**Status:** Draft (2026-08-25) — pick slices; not a Phase 1 reopen  
**Related:** `docs/PHASE_1_BRIEF.md` §9–10, `TODO.md` Phase 3, `.forgetrail/IDEAS.md`, sibling [`localhelm/docs/specs/cheap-surfaces.md`](../../../localhelm/docs/specs/cheap-surfaces.md)  
**Surfaces:** CLI, `~/.localberth/`, dashboard, `localhelm.plugin.mjs` boards / plan / apply

Pairing: **localhost is the machine. LocalBerth is the slip.** This spec is what the slip can know cheaply. LocalHelm may host buttons; it must not reimplement observe, firewall, or spawn.

---

## 1. Problem

Leases, listen table, recipes, spawn pids, and **per-lease logs** already exist. The operator still cannot see “why did 8008 refuse?” without leaving the board. Families (`dictawhisper` + `-api` + `-site`) are three rows with no stack. Parking a product means `release` (lose the number) or leaving a ghost lease in the default list.

**Friction today:** Start/stop works; **forensics and housekeeping** do not. The Vite proxy 500 this week was a closed 8008. The log file was empty or ignored. The recipe confirm did not show `PORT=7777`.

---

## 2. Goals

1. Show listen, recipe, and **last log lines** without a new collector.
2. Park a named lease: stop, hide, **keep the port**.
3. Doctor the slip: missing cwd, leaked PORT on multi-listener recipes, orphans.
4. Expose park / log / family as plugin actions so LocalHelm Ports can host them.

### Non-goals

- `*.localhost`, Caddy, PAC, Portless-shaped front doors (`IDEAS.md` — still later).
- Auto-janitor that deletes firewall rules without a plan (`IDEAS.md`).
- Tailscale Serve as a product feature (compose later).
- Killing **observed-only** rows. Ever.
- Releasing a port as part of park (that is `release`).
- Becoming a process supervisor (no restart loops, no systemd).

---

## 3. In flight (do not redo)

| Item | Where | Note |
| ---- | ----- | ---- |
| Publish `0.2.1`–`0.2.6` | `TODO.md` | Operator publishes. Not a surface. |
| Elevated `firewall sync` dogfood | Phase 3 | Keep. |
| Public site + GitHub on npm | Phase 3 | When those URLs are public. |
| Recipe guess | Shipped | `-site` / `-api` strip, hyphenless folder, `site:dev` / `start` / `serve`. |
| Start/stop + LocalHelm plugin | Shipped | Bridge `process.exit` after JSON. `PORT`/`HOST` = this lease. |
| Hide system observed | Shipped | `scan --all`. |
| `claim --or-next` | Shipped | |

---

## 4. Core concepts

| Term | Meaning |
| ---- | ------- |
| **Park** | `archived` (or `parked`) on the lease. Stop if we spawned or we own the listen pid **for this lease**. Port stays claimed. `get` still prints the number. Default `ls` / plugin board omit parked rows unless `?parked=1` / `ls --all`. |
| **Release** | Free the number. Different verb. Park is not release. |
| **Family** | Stem after folding hyphens and stripping `-site`/`-api`. Same rule as LocalHelm. |
| **Orphan** | Observed listener, no lease. Read-only unless the operator claims. |
| **Log** | `~/.localberth/logs/<name>.log` — already opened on start. |

---

## 5. Proposed surfaces

### 5.1 Free — data we already have

**F1. Log tail.** Last 40 lines of `logs/<name>.log` on the dashboard row and as plugin `cells.log` or a drawer. After a failed or “not listening yet” start, this is the product. Empty log is a sentence: “No log yet — start once.”

**F2. Injected env on plan.** Plan rows already have port, bind, command, cwd. Add `PORT` / `HOST` explicitly. LocalHelm confirm should print them (sibling F8). Catches UI-lease `PORT` stealing an API child.

**F3. Same-cwd family.** Leases that share `startCwd` are one recipe tree (`dictawhisper` serve vs `dictawhisper-api` start). Badge: “shares folder with N.” Doctor warns if two recipes in one cwd both expect exclusive `PORT`.

**F4. Recipe health cells.** `cwd` missing, `package.json` missing, script missing. Plan already fails start; **show it before click**.

**F5. Last seen.** `observed.seenAt` and `lease.updatedAt` are already there. “Listening · seen 2s ago” vs “recipe · never listened.”

**F6. Orphan list.** Observed, `leaseName == null`, not in the system hide-list. One column: claim guess (`process` name slug) + `--or-next` if the port is taken as a lease. Plan-only from Helm.

**F7. Port tape.** Compact list of claimed ports in the 4xxx–6xxx band with holes. Helps `claim --or-next` humans. No pretty canvas required — a sorted CSV in `ls --json` is enough.

**F8. Copy.** `http://127.0.0.1:<port>/`, `localberth start <name>`, `localberth get <name>`. Dashboard already has Open.

### 5.2 Cheap — small schema or commands

**C1. Park / unpark (operator-asked archive, slip side).**

```
localberth park <name>      # plan: stop if running, set parked
localberth unpark <name>
localberth ls --parked
```

- Plugin actions `park` / `unpark` with `writes: true`.
- Stop uses existing `stopLease` rules (no dashboard self-kill, no observed-only).
- `get` unchanged (apps still resolve the port while parked).
- Firewall: leave applied; park is not “close the port to the LAN.” A later confirm can `firewall` skip. Do not auto-delete rules (janitor stays an idea).

**C2. Family start/stop.** `localberth start dictawhisper --family` plans every unparked lease whose stem matches. Apply is sequential start. Failures stay on the row; do not roll back siblings.

**C3. Save guess without start.** `localberth recipe <name> --save-guess` already exists for CLI. Plugin `recipe` apply that only writes cwd/command. Helm hosts “Save guess.”

**C4. Doctor.** `localberth doctor` (read-only):

- cwd missing
- parked + listening (someone started it anyway)
- two listeners on one lease port (`conflict` already on the board)
- same cwd, `pnpm serve` plus a sibling `-api` whose PORT would be overwritten if serve does not isolate children
- `kind=always` and not listening

Exit non-zero if any row is `fail`. JSON for Helm Today looks.

**C5. Brief.** `localberth brief` — listening names, down-with-recipe, parked count, orphan count. Helm `brief` can exec or plugin-read this. Do not duplicate the fleet git story here.

**C6. Quiet.** Stop all listening `*-site` (and optional `kind=ephemeral`) except self-dashboard. Plan lists. Meeting button.

**C7. Last start stamp.** Set `lastStartAt` / `lastStartOk` on the lease when `startLease` returns. One column. Cheap SQLite column.

### 5.3 Later / dear

- Auto-janitor leftover firewall (Engram 5173 story) — plan + confirm only, never silent.
- Tailscale Serve.
- `*.localhost`.
- Optional `lb` bin / scoped npm alias (`IDEAS.md`).
- Health-GET on start (apps hang on `/health` while probing CUDA — do not block `start` on HTTP).

---

## 6. Data

| Store | Change |
| ----- | ------ |
| `~/.localberth/` SQLite leases | Optional `parked`, `lastStartAt`, `lastStartOk` |
| `~/.localberth/logs/<name>.log` | Read tail only. Already written on start. |
| Plugin plan rows | Add `portEnv`, `logTail?`, `family`, `parked` |

Migration: missing `parked` = false. No rewrite of existing recipes.

---

## 7. Plugin contract (for LocalHelm)

New optional actions (all plan then apply):

| Action | Writes | Effect |
| ------ | ------ | ------ |
| `park` | yes | stop + flag |
| `unpark` | yes | clear flag |
| `recipe` | yes | save guess, no spawn |
| `family-start` / `family-stop` | yes | existing start/stop on stem |

Board cells (free): `parked`, `logPreview`, `family`, `cwdOk`.

Bridge must keep `process.exit` after JSON.

---

## 8. Edge cases

| Risk | Mitigation |
| ---- | ---------- |
| Park looks like release | Copy: “Port stays yours. Hidden on the default board.” |
| Serve + PORT leak | F2 + doctor C4; apps must isolate children (dictawhisper 2026-08-25). LocalBerth will not stop setting `PORT` on the lease — that is the slip. |
| Log never fills on Windows | stdio inherit vs `windowsHide` — doctor says empty; do not fake lines. |
| Family `--family` too greedy | Stem must equal, not contain (`file` must not grab `filepress`). |
| Unpark does not start | Correct. Unpark is visibility. Start is separate. |

---

## 9. Milestones

| Milestone | Outcome |
| --------- | ------- |
| B1 | F1 log tail + F2 PORT/HOST on plan |
| B2 | C4 doctor (read-only) |
| B3 | C1 park / unpark + plugin |
| B4 | C2 family start/stop |
| B5 | C3 save-guess plugin action |

---

## 10. Acceptance (when a slice is built)

1. Given a start that is not listening yet, the row can show the last log lines without SSH or Finder.
2. Given `park demo`, `ls` hides it, `get demo` still prints the port, the folder is untouched.
3. Given `doctor`, a missing `startCwd` is `fail` with the lease name.
4. Given family start `dictawhisper`, the plan includes `-api` and `-site` only when those leases exist and are unparked.
5. Observed-only rows never gain Stop/Park.

---

## 11. Open questions

| # | Question | Blocking? |
| - | -------- | --------- |
| 1 | Flag name `parked` vs `archived`? | no — **parked** on the slip; Helm says **archive** for fleet hide |
| 2 | Does `ls` default hide parked? | no — yes, with `--all` |
| 3 | Should park drop LAN firewall? | yes if anyone parks `--lan` leases — default **leave rules** |

---

## 12. Decisions (draft)

**D-draft-1.** Park ≠ release. The number stays.  
**D-draft-2.** `PORT` stays the lease port. Multi-listener recipes own their children.  
**D-draft-3.** Logs are files we already write; tail is the feature.  
**D-draft-4.** Observed-only stays read-only.

---

## Progress

- `2026-08-25:` Draft after start/stop, recipe guess, bridge exit, and the dictawhisper PORT leak. Awaiting operator slice pick.
