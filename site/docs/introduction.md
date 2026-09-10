---
title: Introduction
---

**LocalSlip** is a named local port registry. A name owns a TCP number on this machine. You still type the port. The slip metaphor is a mnemonic. The stored mapping is a lease in `~/.localslip/`.

**localhost** is the machine. **LocalSlip** is the slip.

You start a Svelte app. Vite takes **5173**. You start a second one. It takes **5174**. After a reboot you start them in the other order. The ports swap. Bookmarks, firewall rules, and the phone now hit the wrong app.

Name the port so that does not happen. `foo` stays on 5173. `bar` stays on 5174. An agent or the app asks the CLI instead of hoping Vite picked the same number again.

## What it is

- Named leases persist on the machine that ran the CLI (`~/.localslip/`)
- `localslip get foo` prints only the port, for scripts
- A dashboard on **54321** shows leases and what is listening
- `--lan` on a claim stores bind `0.0.0.0` and syncs an inbound firewall allow on Windows, macOS, and Linux

It is **not** DNS. It does not give you `foo.localhost` URLs. It is **not** a reverse proxy. A claim does not reserve the port at the OS. Another process can still bind it.

## Claims, listeners, and collisions

| Thing | What it means |
| --- | --- |
| Claim / lease | A stored name → port and bind in `~/.localslip/` |
| Listener | A process actually accepting connections |
| Occupied port | Something is listening, or another lease already owns the number |

Without `--or-next`, a second name cannot take a port another lease owns. You can still claim a port that is already listening so you can name an app that is already up. That does not evict the listener.

The Vite helper returns the claimed host and port and the documented config uses `strictPort: true`. The app fails if that port is busy. It does not silently take the next free port.

## Network scope

Default claim bind is `127.0.0.1`. `--lan` changes the stored bind to `0.0.0.0` and asks for an inbound firewall allow. It does not launch the app. `localslip serve --host 0.0.0.0` only exposes the dashboard. The consuming app reads host and port from `localslipListen('foo', 5173)` or `localslip get foo`.

Allocating a port does not protect a service that you start on all interfaces yourself.

## Two surfaces

| Surface | What it is |
| --- | --- |
| [localslip.dev](https://localslip.dev) | This site: what it is and how to use it |
| npm `localslip` | The CLI and dashboard, on your machine |

The domain never serves leases.

[LocalHelm](https://localhelm.dev) hosts start and stop on the Ports tab. Claim, release, and firewall stay on this CLI.

## Next

- [Install](/docs/install) — npm or a checkout
- [Quick start](/docs/quick-start) — claim, get, serve, reboot-order
- [Commands](/docs/commands) — full reference
