# Rename LocalBerth → LocalSlip

**Status:** in progress (D37). Operator staked `localslip` on npm and localslip.com / .dev.

## Locked story

| Surface | Target |
| --- | --- |
| Public name | **LocalSlip** |
| Tagline | Local DNS for ports |
| npm / CLI primary | `localslip` |
| CLI alias | `localberth` (compat until callers move) |
| Site | localslip.com (+ .dev); redirect localberth.com when ready |
| Pairing | LocalSlip = slip; LocalHelm = wheel / control panel |
| Data dir (phase 1) | Keep `~/.localberth/` + `LOCALBERTH_HOME` |
| Data dir (later) | `~/.localslip/` + `LOCALSLIP_HOME`, read old path if present |

Do **not** fold into LocalHelm. Two dashboards stay (`:54321` + Helm `:4321`).

## Checklist

### Done in scaffold

- [x] Decision D37 in `.forgetrail/workflow_tracking.json`
- [x] Dual bin: `localslip` + `localberth`
- [x] package.json `name`: `localslip` (publish as new package; deprecate `localberth` later)
- [x] README / AGENTS / CONTEXT public name → LocalSlip
- [x] Accept `LOCALSLIP_HOME` (falls back to `LOCALBERTH_HOME` / `~/.localberth`)

### Still open

- [ ] Dashboard chrome strings (header, footer, visitor tiles)
- [ ] Site FilePress pages + domain → localslip.com
- [ ] Docs mounts and aibreze overlay
- [ ] `localberthListen` / `localberthPort` exports: add `localslip*` aliases; keep old names until callers update
- [ ] Firewall rule display names / comments that say LocalBerth
- [ ] Self-lease id `localberth` → `localslip` (or keep lease name for dashboard port 54321 — decide before publish)
- [ ] Helm plugin board copy that says LocalBerth
- [ ] Sibling repos: `ensure-lease`, Vite helpers, scripts calling `localberth get`
- [ ] npm: publish `localslip`; `npm deprecate localberth "... use localslip"`
- [ ] GitHub / repo folder rename (optional; fleet enroll id follows folder)
- [ ] Migrate `~/.localberth` → `~/.localslip` with one-shot copy + env note
- [ ] localberth.com → localslip.com redirect

## Publish note

First `localslip` publish is a **new** package name. Existing `localberth` installs keep working until deprecated. Prefer dual bin in both packages during the overlap if you still cut `localberth` patches.
