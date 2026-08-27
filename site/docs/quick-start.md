---
title: Quick start
---

## Claim two apps

```bash
localslip claim foo --port 5173
localslip claim bar --port 5174
localslip get foo
```

`get` prints only the port (`5173`), for scripts:

```bash
PORT=$(localslip get foo)
```

On Windows PowerShell:

```text
$env:PORT = localslip get foo
```

## Open the dashboard

```bash
localslip serve
```

Then visit `http://127.0.0.1:54321`. Loopback is the operator board. A phone on Tailscale or LAN sees the visitor tiles.

To reach an app from the phone, claim with `--lan` (or start the app on all interfaces):

```bash
localslip claim foo --port 5173 --lan
localslip serve --host 0.0.0.0
```

## See what is listening

```bash
localslip ls
localslip scan
```

`scan` hides common OS ports unless you pass `--all`. It never kills a process.

## Vite

Pin host and port from the lease. See [Vite](/docs/vite).
