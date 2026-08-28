# Ideas (not v1)

- `*.localhost` / Caddy front door (Portless-shaped) as an optional later layer
- [x] Process start/stop from the dashboard → LocalHelm Ports hosts Start/Stop; LocalSlip owns `start`/`stop` + lease recipe
- Auto-janitor for leftover firewall rules (e.g. Engram 5173)
- Tailscale Serve integration
- Vite/SvelteKit helper that sets `server.port` from `localslip get` — **shipped** (`localslip/port`). House rollout notes stay local.
- Scoped npm alias `@catalystforge/localslip` pointing at the same unscoped `localslip` package
- Optional `lb` bin alias
- Cheap surfaces: B1+B2 landed (log tail, PORT/HOST on plan, doctor). Remaining: [`docs/specs/cheap-surfaces.md`](../docs/specs/cheap-surfaces.md) (park, family start, save-guess)
