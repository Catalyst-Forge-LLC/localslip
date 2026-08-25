---
title: Commands
---

| Command | Description |
| --- | --- |
| `localberth get <name>` | Print the port (scripts) |
| `localberth claim <name> …` | Name a TCP port |
| `localberth recipe <name> --cwd PATH` | Store a start recipe (default `pnpm serve`) |
| `localberth start <name>` | Start the recipe detached |
| `localberth stop <name> [--force]` | Stop the process tree; keeps the lease |
| `localberth release <name> [--force]` | Drop a lease |
| `localberth ls` | List leases |
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
