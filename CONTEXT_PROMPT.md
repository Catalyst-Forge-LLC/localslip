# Context — LocalSlip

## What this is

**Local DNS for ports.** **localhost** is the machine; **LocalSlip** is the slip. **LocalHelm** is the wheel. Apps look up a port by name; humans still use the number. Not real DNS and not `*.localhost` URLs. Dashboard shows leases plus observed listeners. Claim/move updates the host firewall (Windows / macOS / Linux).

Formerly **LocalBerth**. Rename in flight — see `docs/RENAME_TO_LOCALSLIP.md`. The `localberth` binary remains an alias.

## Hero workflow

Vite 5173/5174 swap after reboot is the common story. Public examples use `fizzbuzz`, not sibling app names. Hero: `localslip claim fizzbuzz --port 5193` is loopback. Phone/LAN: add `--lan` (binds `0.0.0.0`, firewall). Then `PORT=$(localslip get fizzbuzz)` → dashboard at `:54321` → phone uses `http://100.x.x.x:5193`.

## Stack

SvelteKit 5 + Tailwind 4 + pnpm + TypeScript ESM + `@sveltejs/adapter-node` + SQLite (`better-sqlite3` **^13**, N-API prebuilds in the tarball; do **not** put it in `pnpm.onlyBuiltDependencies` or pnpm runs node-gyp). Published CLI is `tsc` output (`pnpm build:cli` / `prepublishOnly`). `tsx` is repo-only (`pnpm cli`, tests). Live data: `~/.localberth/` for now (`LOCALSLIP_HOME` or `LOCALBERTH_HOME`). Dashboard port **54321**. FilePress site in `site/` → localslip.com (cutover in progress; was localberth.com).

## Architecture at a glance

- `src/cli/main.ts` — `get` / `claim` (`--or-next`) / `recipe` / `start` / `stop` / `quiet` / `park` / `unpark` / `release` / `ls` / `scan` / `doctor` / `firewall sync` / `serve`
- `localhelm.plugin.mjs` — Ports tab in LocalHelm (leases + observed + Start/Stop plan/apply). Does not reimplement the board. The bridge `process.exit`s after JSON so LocalHelm’s `spawnSync` returns even if a started recipe is still running.
- `src/lib/port.ts` — `localberthListen(name, fallback)` (host + port) and `localberthPort` for Vite configs. Pin `server.host` or Windows Vite binds `[::1]`.
- `src/lib/server/registry.ts` — lease persist + self-lease `localberth` → 54321
- `src/lib/server/observe.ts` — OS listen table (read-only)
- `src/lib/server/firewall/` — netsh (named rules), pf anchor, ufw comments / firewalld rich rules; loopback skips inbound
- `src/routes/` — local dashboard (not localberth.com)
- Public copy: `docs/aibreze-overlay.md`
- `site/` — FilePress explainer

## Conventions

- Package manager: pnpm
- Modules: ESM only
- Language: TypeScript (strict)
- Do not hide ports behind name-only URLs
- Observed-only rows stay read-only. Named leases can start/stop via an explicit command. If no recipe is stored, LocalSlip may guess a sibling folder (`name`, strip `-site` / `-api`, or hyphenless match like `temperpass-site` → `temper-pass`) and `pnpm site:dev` / `start` / `serve` / `dev`. LocalHelm confirm saves that guess; CLI needs `--save-guess`. `start` sets `PORT`/`HOST` to that lease. A recipe that also starts other listeners (dictawhisper UI+API) must give those children their own port.
- Public README is the operator/npm page (no ForgeTrail or sibling notes)
- Omit homepage / repository on npm until the site and GitHub repo are public

## Current phase

`3-stabilization`

Rename: D37 + `docs/RENAME_TO_LOCALSLIP.md` (LocalBerth → LocalSlip).

## Recent gotchas (last 3–5)

- npm 12 blocks dependency install scripts. `better-sqlite3` 12 needs `prebuild-install` and dies at runtime after `npm i -g`. Use **^13** (ships `prebuilds/*.node`) or `--allow-scripts=better-sqlite3`.
- npmjs.com Readme tab can show “no README” even when the tarball and `npm view readme` are correct (indexer / staged publish). Republish or wait.
- Relative README images 404 on npm unless the file is in the `files` whitelist (0.1.0 logo).
- Do not put machine paths (`z:/workspace/...`) in committed files.

## Pointers

- Brief: `docs/PHASE_1_BRIEF.md`
- Cheap surfaces (draft): `docs/specs/cheap-surfaces.md`. B1–B5 plus quiet / recipe health / `--guess-all`. Tippy on the board for Open, copy, and recipe facts. `localslip quiet` (alias `localberth quiet`) stops listening `*-site` (dashboard stays).
- Rename checklist: `docs/RENAME_TO_LOCALSLIP.md`
- Tracking: `.forgetrail/workflow_tracking.json`
- TODO: `TODO.md`
