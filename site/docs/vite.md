---
title: Vite
---

Do not add the `localslip` npm package just to read a port. That package pulls `better-sqlite3`. Use the CLI (already on PATH if you claimed the slip):

```ts
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';

function localslipPort(name: string, fallback: number): number {
	try {
		const out = execSync(`localslip get ${name}`, { encoding: 'utf8', timeout: 5000, windowsHide: true });
		const port = Number(out.trim());
		return Number.isInteger(port) && port > 0 ? port : fallback;
	} catch {
		return fallback;
	}
}

export default defineConfig({
	server: { host: '127.0.0.1', port: localslipPort('foo', 5173), strictPort: true }
});
```

`execSync` runs through the shell, so the Windows `localslip.cmd` shim resolves without passing `shell: true` alongside an argument list (Node 24 warns about that). The fallback applies only when `get` fails: LocalSlip is not on PATH, or there is no claim. The missing-claim message still prints to the terminal.

Pin `host` to `127.0.0.1`. Vite’s default `localhost` is often `[::1]` on Windows while the claim is IPv4.

`import { localslipListen } from 'localslip/port'` is only for the LocalSlip app itself. It opens the lease database.

`strictPort: true` is required for the stable mapping. Without it Vite can pick another port and ignore the claim.

If the claimed port is busy, Vite exits. LocalSlip does not move the lease. Use `localslip ls` and `localslip scan` to see the claim versus the listener.

For a phone tile, start Vite with `--host` (or `server.host: true`) so the process listens past loopback. A loopback claim does not stop you from doing that. `--lan` is what records the intended bind and firewall rule.
