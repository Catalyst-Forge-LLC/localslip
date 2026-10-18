---
title: "Keep each app at the port you expect."
description: "When development apps start in a different order, their URLs should not swap. LocalSlip assigns a port to a name, and your app integration reads that assignment before starting."
---

<section class="value-hero" aria-label="LocalSlip overview"><div class="value-intro"><p class="value-kind">Named local port registry and CLI</p><h1>Keep each app at the port you expect.</h1><p class="value-lede">When development apps start in a different order, their URLs should not swap. LocalSlip assigns a port to a name, and your app integration reads that assignment before starting.</p><div class="cta-row"><a class="cta cta-primary" href="/install">Install LocalSlip</a><a class="cta cta-secondary" href="#claim-a-port-then-make-the-app-read-it">Wire a first app</a></div><p class="value-limit">A claim does not start or reconfigure the app. Connect the integration, start the app, and confirm the printed URL.</p></div><figure class="value-proof"><figcaption>Illustrative example</figcaption><p><strong>Starting point</strong><br>Today: notes gets 5173, shop gets 5174. Tomorrow they start in reverse order.</p><div class="value-result"><p><strong>What you get</strong><br>Named claims: <code>notes → 5173</code>, <code>shop → 5174</code>.</p></div><p>Apps that read their claims use the intended port regardless of startup order.</p><p class="value-note">Illustrative assignments. The app must read the claim in its configuration.</p></figure></section>

## Claim a port, then make the app read it

Creating a claim does not start or reconfigure the app. Add the integration, then start the app and confirm the printed URL. The app keeps its old port until its config reads the claim.

**1. Record the claim.**

```bash
localslip claim notes --port 5173
localslip get notes
```

`get` prints only the port (`5173`).

**2. Make the app read it.** In the app's `vite.config.ts`:

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
	// keep your existing plugins
	server: { host: '127.0.0.1', port: localslipPort('notes', 5173), strictPort: true },
});
```

This example reads the claimed port and binds Vite to `127.0.0.1`. A LAN claim records your intended wider bind, but the application must be configured to use that bind separately. This sample does not read the stored host.

`strictPort: true` makes Vite exit when 5173 is busy instead of moving to 5174. The fallback applies only when `localslip get` fails, for example when LocalSlip is not installed or the claim does not exist. More in [Vite](/docs/vite).

**localhost** is the machine. **LocalSlip** is the slip. The mechanism is a named registry on this computer (`~/.localslip/`). It is not DNS, not a reverse proxy, and not an OS port reservation. Another process can still bind the port. You still type the port.

Start and stop also live on [LocalHelm](https://localhelm.dev). Claim, release, and firewall stay here.

A claim records loopback (`127.0.0.1`) unless you pass `--lan`. `--lan` stores bind `0.0.0.0` and tries to add an inbound firewall allow. It does not start the app or bind the app's socket. The app must honor the stored host and port.

After you install, `localslip serve` listens on all interfaces. The lease table is `http://127.0.0.1:54321`. A Tailscale or LAN address shows the visitor tiles.

[Docs](/docs) · [Install](/install) · [LocalHelm](https://localhelm.dev)
