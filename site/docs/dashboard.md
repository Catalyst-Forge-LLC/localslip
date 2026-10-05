---
title: Dashboard
---

```bash
localslip serve
localslip serve --host 127.0.0.1
```

Default bind is all interfaces on **54321**. `server` is an alias of `serve`. `--host` pins one address.

## Operator

Open `http://127.0.0.1:54321` on the machine. You get the lease table, observed listeners, and a peek of each HTTP port. Expand a row for command line, executable, parent, start time, and cwd when the OS has them (Windows has no cheap cwd). The Open icon reuses one browser tab. **Deck** in the header opens the same tiles a phone sees, at `/deck`. Start and stop also live on [LocalHelm](https://localhelm.dev) Ports.

## Visitor

Open the same port from a phone (Tailscale `100.x` or LAN). You get tiles: the app’s title and icon, and a band with the port. When the page title is not the lease name, the band includes the name. A tile opens `/s/<name>` on this dashboard, so a stopped app shows a page instead of a refused connection. Long-press copies that link. The header stays put; only the grid scrolls.

A tile appears when a **named** lease has a process listening past loopback. Vite `--host` counts, even if the claim is still `127.0.0.1`. If nothing qualifies, the deck says nothing is listening on this address.

## Open by name

`http://127.0.0.1:54321/s/engram` redirects to that lease. The host in the redirect is the host you typed, so a Tailscale address stays on Tailscale. A path and query go with it: `/s/engram/imports?tab=1` lands on `:5193/imports?tab=1`. Deck tiles and the Open button on a named row use this path. A listener with no lease still opens on its own address.

On the lease table, a process bind that does not match the claim shows **wider**, **narrower**, or **other** beside the bind. A second listener on that port shows **also**.

If the name is not leased, or nothing is listening, you get a short page instead of a refused connection. A near miss offers up to three leased names as links. A phone does not get sent to a loopback-only process. [LocalHelm](https://localhelm.dev) answers the same `/s/name` path by asking this dashboard.

## Peek

Peek is loopback-only. The phone never calls `/api/peek`. LocalSlip reads the HTML on the host and puts the title and icon on the tile.
