---
title: Dashboard
---

```bash
localslip serve
localslip serve --host 127.0.0.1
```

Default bind is all interfaces on **54321**. `server` is an alias of `serve`. `--host` pins one address.

## Operator

Open `http://127.0.0.1:54321` on the machine. You get the lease table, observed listeners, and a peek of each HTTP port. Expand a row for command line, executable, parent, start time, and cwd when the OS has them (Windows has no cheap cwd). The Open icon reuses one browser tab. Start and stop also live on [LocalHelm](https://localhelm.dev) Ports.

## Visitor

Open the same port from a phone (Tailscale `100.x` or LAN). You get tiles: the app’s title and icon, a `:PORT` band, long-press to copy the URL. The header stays put; only the grid scrolls.

A tile appears when a **named** lease has a process listening past loopback. Vite `--host` counts, even if the claim is still `127.0.0.1`.

## Open by name

`http://127.0.0.1:54321/s/engram` redirects to that lease. The host in the redirect is the host you typed, so a Tailscale address stays on Tailscale. A path and query go with it: `/s/engram/imports?tab=1` lands on `:5193/imports?tab=1`.

If the name is not leased, or nothing is listening, you get a short page instead of a refused connection. A phone does not get sent to a loopback-only process. [LocalHelm](https://localhelm.dev) answers the same `/s/name` path by asking this dashboard.

## Peek

Peek is loopback-only. The phone never calls `/api/peek`. LocalSlip reads the HTML on the host and puts the title and icon on the tile.
