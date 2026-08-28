# LocalSlip TODO

## Phase 2 spine

1. [x] Registry persist + `get` / `claim` / `ls`
2. [x] `scan` (OS listen table)
3. [x] Dashboard: leases + observed
4. [x] Firewall sync on claim (Windows / macOS / Linux)
5. [x] Self-lease `localslip` → 54321
6. [x] npm package shape (`name` / `bin` / files)
7. [x] FilePress `site/` (home + install + how-to)

## After the spine

- [x] `release` + `serve`
- [x] Hide system/RPC observed ports (toggle / `scan --all`)
- [x] Vite helper `localslipPort()` (`localslip/port`)
- [x] Harden firewall backends (pf anchors, firewalld rich rules, loopback skip)

## Cheap surfaces (draft spec)

See [`docs/specs/cheap-surfaces.md`](docs/specs/cheap-surfaces.md).

- [x] Log tail + `PORT`/`HOST` on start plan _(B1, 2026-08-25)_
- [x] `localslip doctor` (read-only) _(B2, 2026-08-25)_
- [x] Park / unpark (keep the port) _(B3, 2026-08-25)_
- [x] Family start/stop + save-guess plugin action _(B4+B5, 2026-08-25)_
- [x] Quiet sites, recipe health, guess-all, Tippy details _(2026-08-25)_

## Phase 3

1. [x] README matches the real CLI (public/npm page, no process notes)
2. [x] Sad-path messages: missing `get`, busy `serve` port
2b. [x] `claim --or-next` when the requested port is leased or listening
3. [ ] Dogfood: elevated `firewall sync` for non-loopback leases
4. [ ] Public site + GitHub URLs on npm when those are public
5. [x] Publish `localberth@0.1.0`–`0.2.0` (historical; you; agent does not)
6. [x] Sibling LocalSlip rollout — waves 0–2 (FilePress engine + house sites + Engram + DictaWhisper). Wave 3 is other Vite apps.
7. [x] Publish `localslip@0.2.10`; deprecate `localberth`; stub `localberth@0.2.9` points at localslip (you; 2026-08-28)

