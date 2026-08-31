---
title: Dashboard
---

```bash
localslip serve
localslip serve --host 0.0.0.0
```

Default bind is loopback on **54321**. `server` is an alias of `serve`.

## Operator

Open `http://127.0.0.1:54321` on the machine. You get the lease table, observed listeners, and a peek of each HTTP port. Expand a row for command line, executable, parent, start time, and cwd when the OS has them (Windows has no cheap cwd). The Open icon reuses one browser tab. Start and stop also live on [LocalHelm](https://localhelm.dev) Ports.

## Visitor

Open the same port from a phone (Tailscale `100.x` or LAN). You get tiles: the app’s title and icon, a `:PORT` band, long-press to copy the URL. The header stays put; only the grid scrolls.

A tile appears when a **named** lease has a process listening past loopback. Vite `--host` counts, even if the claim is still `127.0.0.1`.

## Peek

Peek is loopback-only. The phone never calls `/api/peek`. LocalSlip reads the HTML on the host and puts the title and icon on the tile.
