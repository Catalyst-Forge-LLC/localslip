---
app_facts_version: 0.1.0
name: localslip
type: "web app (SSR)"
status: active
license: Apache-2.0
homepage: https://localslip.dev
repository: https://github.com/Catalyst-Forge-LLC/localslip
stack:
  language: "TypeScript, Svelte, JavaScript, CSS, Shell, HTML"
  runtime: Node.js
  framework: SvelteKit
  styling: Tailwind CSS
  database: SQLite
  hosting: local
key_dependencies:
  - name: "@sveltejs/kit"
    purpose: web framework for the dashboard
  - name: better-sqlite3
    purpose: persistent storage for port leases
  - name: tailwindcss
    purpose: styling utility
  - name: tsx
    purpose: TypeScript execution for CLI scripts
build:
  package_manager: pnpm
  test: svelte-check
  ci: undisclosed
generated:
  date: 2026-08-20
  generator: "appfacts-cli v0.1.0 (ollama:gemma4:12b)"
  inputs_fingerprint: 781cbab31d853ca4
---

# localslip

`web app (SSR)` · **active** · Apache-2.0

Curated stack label for this repository — aimed at an under-a-minute skim.

**[Open visual label →][appfacts-label]** · or scan `APP_FACTS.png`

[Repository](https://github.com/Catalyst-Forge-LLC/localslip)

### Stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript, Svelte, JavaScript, CSS, Shell, HTML |
| Runtime | Node.js |
| Framework | SvelteKit |
| Styling | Tailwind CSS |
| Database | SQLite |
| Hosting | local |

### Key dependencies

- `@sveltejs/kit` — web framework for the dashboard
- `better-sqlite3` — persistent storage for port leases
- `tailwindcss` — styling utility
- `tsx` — TypeScript execution for CLI scripts

### Build

- **Package Manager** — pnpm
- **Test** — svelte-check

---
*Generated with [AppFacts](https://appfacts.dev) · Scan `APP_FACTS.png` or open the [visual label][appfacts-label]*

[appfacts-label]: https://appfacts.dev/v#af1.eNpNUsuu0zAQ_RVrViA5LY9dVqBKiEdAgtwdQmjizE1849jGM0lvVPXfkZPQsh2f18zxBWYoX2vwOBKU4IJBx85G0CBLzKMzNQpjVC_q-sdL0MCCMjGUgEbsTKDBWUOeM_Z9RNNT8ebwagOaAcoLOPTdhF0GPCyRapNsFK3qmZyQVp9xxn-zU11rVffknFYfH75WoCFNXuwa7lto6fDEoOEx4UjnkAYoYZP5YmW1XJz1XTZC687Wt1kRNLQo2OCasf5eWcmx-8Cygdet4aqhpchQ_ryAhxLe8ar8xMdhFY_7MW7m6jEkJT2pFrlvAqYWrnrjNiRCqeA_zgq93cmRElsW8qJYQsKOVoUYkihHyMQ3vuzxDfNO3ldTk1hnZbkj-XlH3G-r6JnMJDb41eBUfVK8PjBcf2loJuvaXExEM2BHv0f02FHKEX0cc_XEkj3XAxSmJzOABmOhhMm3lo0LTHlb6MNIceu2F4lcHo-3P3Roac4FUgxsJaTlP1BnpZ-agwnj8YSCbmEpPoTUUVFVp7sEXP8CZOHjHg
