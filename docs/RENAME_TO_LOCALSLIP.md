# Rename LocalBerth → LocalSlip

Hard cutover. LocalBerth as a public name goes away.

## Locked

| | |
|---|---|
| Public name | **LocalSlip** |
| Tagline | Local DNS for ports |
| npm / CLI | `localslip` (`localberth` bin is a one-release alias) |
| Site | **localslip.dev** (primary, same family as localhelm.dev) |
| Redirects | localslip.com → localslip.dev; localberth.com → localslip.dev |
| Pairing | LocalSlip is the slip; LocalHelm is the wheel |
| Self-lease | `localslip` → 54321 |
| Data dir | `~/.localslip/` + `localslip.sqlite` (`LOCALSLIP_HOME`) |
| Plugin id | `localslip` |
| GitHub | rename `localberth` → `localslip` |

First run copies `~/.localberth` into `~/.localslip` if the new folder is missing, then uses only the new path. Old Windows/Linux firewall rules named `LocalBerth …` are leftover; new rules are `LocalSlip …`.

## Done in code

- [x] Dual bin: `localslip` + `localberth`
- [x] package.json `name`: `localslip`
- [x] README / AGENTS / CONTEXT
- [x] `~/.localslip` + `LOCALSLIP_HOME` + `localslip.sqlite`
- [x] Self-lease `localslip`; rename a leftover `localberth` row
- [x] `localslipListen` / `localslipPort` (old names still exported)
- [x] Firewall prefix `LocalSlip`; pf anchor `localslip`
- [x] Dashboard chrome, visitor tiles, built-in serve footer
- [x] Site FilePress + docs copy → localslip.dev
- [x] Helm plugin id + board copy `localslip`

## Still operator-side

- [ ] `gh repo rename localslip` (folder rename follows; fleet enroll id follows the folder)
- [ ] Point localslip.dev at the FilePress site; redirect .com and localberth.com
- [ ] Cloudflare Pages project `localslip` (was `localberth`)
- [ ] Publish first `localslip` npm cut
- [ ] `npm deprecate localberth "use localslip"` or unpublish
- [ ] Sibling repos still calling `localberth get` / `localberthListen`

Do not publish from an agent unless asked.
