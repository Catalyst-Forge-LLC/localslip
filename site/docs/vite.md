---
title: Vite
---

Pin `host` and `port` from the lease. Vite’s default host is `localhost`, which on Windows is often `[::1]` only while the claim is `127.0.0.1`. Same port, two sockets.

```ts
import { localslipListen } from 'localslip/port';

const listen = localslipListen('foo', 5173);

export default defineConfig({
	server: { host: listen.host, port: listen.port, strictPort: true }
});
```

`localslipPort(name, fallback)` still returns just the number.

If the name is missing and you pass a fallback, you get `127.0.0.1` and that port. If there is no fallback, it throws.

`strictPort: true` is required for the stable mapping. Without it Vite can pick another port and ignore the claim.

If the claimed port is busy, Vite exits. LocalSlip does not move the lease. Use `localslip ls` and `localslip scan` to see the claim versus the listener.

For a phone tile, start Vite with `--host` (or `server.host: true`) so the process listens past loopback. A loopback claim does not stop you from doing that. `--lan` is what records the intended bind and firewall rule.
