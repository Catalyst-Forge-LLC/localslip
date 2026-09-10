---
title: Claim
---

A claim names a TCP port on this machine. It writes a lease to `~/.localslip/`. It does not call `bind()` for your app and does not lock the port at the OS. Default stored bind is `127.0.0.1`.

```bash
localslip claim foo --port 5173
localslip claim foo --port 5173 --lan
localslip release foo
```

## Flags

| Flag | What it does |
| --- | --- |
| `--port N` | Request this TCP port. Omit it and LocalSlip picks the next free port from the always pool (`46000–46999`). |
| `--bind ADDR` | Listen address. Default `127.0.0.1`. |
| `--lan` | Bind `0.0.0.0` and sync an inbound firewall allow. Do not pass `--bind` with this. |
| `--ephemeral` | Scratch lease. Pool is `47000–47999` if you omit `--port`. |
| `--notes TEXT` | Stored on the lease. |
| `--or-next` | If `--port` is already leased or something is already listening, take the next free pool port instead. |

Without `--or-next` you can still claim a port that is already listening. That is how you name an app that is already up. A second name cannot take a port another lease already owns. Pass `--or-next` to get a free pool port instead of the one you asked for. The CLI tells you when it fell back.

Occupied-port outcome: if `foo` already owns 5173, `localslip claim bar --port 5173` fails. If nothing is leased but Vite is already on 5173, `claim foo --port 5173` succeeds as a name for that listener. The Vite helper with `strictPort: true` then refuses to start a second process on 5173.

```bash
localslip claim scratch --port 5173 --or-next
localslip release scratch
```

`localslip` itself is reserved on **54321**. Release it only with `--force`.
