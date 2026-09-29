---
app_facts_version: 0.1.0
name: LocalSlip
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

# LocalSlip

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

[appfacts-label]: https://appfacts.dev/v#af1.eNpNUU2P0zAQ_SvWnEBy2wVuOYEqIRYCEmRvCKGJM5vM1rGNZ9JuVPW_I6dhy9V-X_PeGY5QvbEQcCSooI4OfeM5gQWdU3k6UWswJfOqaX68BguiqJNABeiUjwQWPDsKUrAfErqBNm-3d1egO0B1Bo-hn7AvgIc5UeMyJ7WmOZJXsuYzHvHf275prGkG8t6aTw9fa7CQp6C8hPsWO9o-CVh4zDjSKeYDVHCV-cK6WM6eQ1-MkP2JQ1cUwUKHii0uGZvvNWuJPUTRK9iXq-FioaMkUP08Q4AK3sui_CS7wyKe1jJezM1jzEYHMh3K0EbMHVzslduSKuWN_PGs9G4lJ8rCohTUiMaMPS0KKWY1nlBIXvi6xnciK3k9zUzKnnW-IeV5Rdy6NfRMblKOYTHY1_dGlg-Byy8L7cS-K8MkdAfs6feIAXvKJWJIY5meRIvnUsDGDeQOYMExVDCFjsX5KFSuhSGOlK7bDqpJqt1uaVM8p21HxzIgpSisMc__gXrWYWq3Lo67PSr6WXTzMeaeNnW9v0nA5S_A8uLe
