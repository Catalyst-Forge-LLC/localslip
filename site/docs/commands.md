---
title: Commands
---

| Command | Description |
| --- | --- |
| `localberth get <name>` | Print the port (scripts) |
| `localberth claim <name> …` | Name a TCP port |
| `localberth recipe <name> --cwd PATH` | Store a start recipe (default `pnpm serve`) |
| `localberth recipe <name> --save-guess` | Save a guessed folder + command; does not start |
| `localberth start <name>` | Start the recipe detached (`--family` starts the stack) |
| `localberth stop <name> [--force]` | Stop the process tree; keeps the lease (`--family` stops the stack) |
| `localberth park <name>` | Stop if running and hide; port stays yours |
| `localberth unpark <name>` | Show again; does not start |
| `localberth release <name> [--force]` | Drop a lease |
| `localberth ls [--parked\|--all]` | List leases (hides parked unless flagged) |
| `localberth doctor [--json]` | Read-only slip check (cwd, conflicts, `PORT` leak risk) |
| `localberth scan [--all]` | List listening sockets |
| `localberth firewall sync` | Apply inbound rules for `--lan` leases |
| `localberth firewall status` | Show rule state |
| `localberth serve [--host ADDR] [--port N]` | Open the dashboard |
| `localberth server` | Same as `serve` |

```bash
localberth --help
```

Deep pages: [Claim](/docs/claim), [Dashboard](/docs/dashboard), [Firewall](/docs/firewall), [Vite](/docs/vite).
