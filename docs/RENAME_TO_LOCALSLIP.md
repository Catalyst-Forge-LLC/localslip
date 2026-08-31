# Rename LocalBerth → LocalSlip

Hard cutover. LocalBerth as a public name goes away.

## Locked

| | |
|---|---|
| Public name | **LocalSlip** |
| Tagline | Local DNS for ports |
| npm / CLI | `localslip` only (no `localberth` bin; D42) |
| Site | **localslip.dev** (primary, same family as localhelm.dev) |
| Redirects | localslip.com → localslip.dev; localberth.com → localslip.dev |
| Pairing | LocalSlip is the slip; LocalHelm is the wheel |
| Self-lease | `localslip` → 54321 |
| Data dir | `~/.localslip/` + `localslip.sqlite` (`LOCALSLIP_HOME`) |
| Plugin id | `localslip` |
| GitHub | rename `localberth` → `localslip` |

First run copies `~/.localberth` into `~/.localslip` if the new folder is missing, then uses only the new path. Old Windows/Linux firewall rules named `LocalBerth …` are leftover; new rules are `LocalSlip …`.

## Done in code

- [x] Dual bin removed (D42): `localslip` only. `bin/localberth.mjs` deleted.
- [x] package.json `name`: `localslip`
- [x] README / AGENTS / CONTEXT
- [x] `~/.localslip` + `LOCALSLIP_HOME` + `localslip.sqlite`
- [x] Self-lease `localslip`; rename a leftover `localberth` row
- [x] `localslipListen` / `localslipPort` (old names still exported)
- [x] Firewall prefix `LocalSlip`; pf anchor `localslip`
- [x] Dashboard chrome, visitor tiles, built-in serve footer
- [x] Site FilePress + docs copy → localslip.dev
- [x] Helm plugin id + board copy `localslip`
- [x] Public gloss is **slip** (home + README); overlay no longer treats berth as a product word
- [x] README AppFacts raw URL → `Catalyst-Forge-LLC/localslip`

## Still operator-side

- [x] GitHub repo renamed to [Catalyst-Forge-LLC/localslip](https://github.com/Catalyst-Forge-LLC/localslip) (2026-08-27). Local folder and fleet id are `localslip`. Dashboard recipe cwd is `Z:/workspace/localslip`. Site lease is `localslip-site` on 5187.
- [ ] Point localslip.dev at the FilePress site; redirect .com and localberth.com
- [ ] Cloudflare Pages project `localslip` (was `localberth`)
- [x] Publish first `localslip` npm cut (`localslip@0.2.10`)
- [x] `npm deprecate localberth` (all versions through 0.2.8). Stub `localberth@0.2.9` is the npm page pointer. Re-deprecate `0.2.9` if that version still lacks the warning.
- [ ] Sibling repos still calling `localberth get` / `localberthListen`

Do not publish from an agent unless asked.
