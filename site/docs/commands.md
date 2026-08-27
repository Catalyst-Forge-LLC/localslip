---
title: Commands
---

| Command | Description |
| --- | --- |
| `localslip get <name>` | Print the port (scripts) |
| `localslip claim <name> …` | Name a TCP port |
| `localslip recipe <name> --cwd PATH` | Store a start recipe (default `pnpm serve`) |
| `localslip recipe <name> --save-guess` | Save a guessed folder + command; does not start |
| `localslip recipe --guess-all` | Save a guess for every lease that has no recipe |
| `localslip start <name>` | Start the recipe detached (`--family` starts the stack) |
| `localslip stop <name> [--force]` | Stop the process tree; keeps the lease (`--family` stops the stack) |
| `localslip quiet` | Stop listening `*-site` leases; dashboard stays up |
| `localslip park <name>` | Stop if running and hide; port stays yours |
| `localslip unpark <name>` | Show again; does not start |
| `localslip release <name> [--force]` | Drop a lease |
| `localslip ls [--parked\|--all]` | List leases (hides parked unless flagged) |
| `localslip doctor [--json]` | Read-only slip check (cwd, conflicts, `PORT` leak risk) |
| `localslip scan [--all]` | List listening sockets |
| `localslip firewall sync` | Apply inbound rules for `--lan` leases |
| `localslip firewall status` | Show rule state |
| `localslip serve [--host ADDR] [--port N]` | Open the dashboard |
| `localslip server` | Same as `serve` |

```bash
localslip --help
```

Deep pages: [Claim](/docs/claim), [Dashboard](/docs/dashboard), [Firewall](/docs/firewall), [Vite](/docs/vite).
