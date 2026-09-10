---
title: Quick start
---

## Claim two apps

```bash
localslip claim notes --port 5173
localslip claim shop --port 5174
localslip get notes
```

`get` prints only the port (`5173`), for scripts:

```bash
PORT=$(localslip get notes)
```

On Windows PowerShell:

```text
$env:PORT = localslip get notes
```

## Reboot-order example

Same claims after you start the apps in either order.

```ts
// notes/vite.config.ts
import { localslipListen } from 'localslip/port';
const listen = localslipListen('notes', 5173);
export default defineConfig({
  server: { host: listen.host, port: listen.port, strictPort: true }
});
```

```ts
// shop/vite.config.ts
import { localslipListen } from 'localslip/port';
const listen = localslipListen('shop', 5174);
export default defineConfig({
  server: { host: listen.host, port: listen.port, strictPort: true }
});
```

Start `shop` first, then `notes`, or the other way around. `notes` is still 5173. `shop` is still 5174. LocalHelm is optional. You can start the processes yourself.

If something else is already bound to 5173, the notes app exits instead of moving to 5175. That is the occupied-port outcome. Pass `--or-next` only when you want a different number recorded.

## Open the dashboard

```bash
localslip serve
```

Then visit `http://127.0.0.1:54321`. Loopback is the operator board. A phone on Tailscale or LAN sees the visitor tiles.

To reach an app from the phone, claim with `--lan` and start the app on the stored bind (`0.0.0.0`):

```bash
localslip claim notes --port 5173 --lan
localslip serve --host 0.0.0.0
```

`--lan` on claim is the lease and firewall. `--host` on serve is the dashboard only.

## See what is listening

```bash
localslip ls
localslip scan
```

`scan` hides common OS ports unless you pass `--all`. It never kills a process.

## Vite

Pin host and port from the lease. See [Vite](/docs/vite).
