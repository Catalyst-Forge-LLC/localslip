<p align="center">
  <img src="https://raw.githubusercontent.com/Catalyst-Forge-LLC/localslip/main/site/static/logo.png" alt="LocalSlip" width="218" />
</p>

# LocalSlip

**A named port registry for local development.**

> **slip** *n.* *a boat's allotted place at a dock.*

Vite hands out 5173, then 5174. Reboot, and they swap. Name the port so they do not. A claim is a record in `~/.localslip/`, not an OS reservation: another process can still bind the port, so the app has to read its claim.

**localhost** is the machine; **LocalSlip** is the slip. [LocalHelm](https://localhelm.dev) is the wheel.

Formerly **LocalBerth**. Install `localslip`.

**Docs:** [localslip.dev/docs](https://localslip.dev/docs) · **Site:** [localslip.dev](https://localslip.dev)

## Install

```bash
npm i -g localslip
```

or `pnpm add -g localslip`. Node.js 20+. `localslip serve` opens the dashboard at `http://127.0.0.1:54321`.

## Claim a port, then make the app read it

Two steps. The claim only writes a record. The app keeps its old port until its config reads the claim.

**1. Record the claim.**

```bash
localslip claim notes --port 5173
localslip get notes      # prints 5173
```

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

`strictPort: true` makes Vite exit when the port is busy instead of moving on. The fallback applies only when `localslip get` fails (LocalSlip not installed, or no claim). Do not import `localslip/port` in your app; it opens the lease database and pulls `better-sqlite3`. See [Vite](https://localslip.dev/docs/vite).

## More commands

```bash
localslip claim shop --port 5174
localslip claim notes --port 5173 --lan
localslip serve --host 0.0.0.0
```

`--lan` stores bind `0.0.0.0` and syncs an inbound firewall allow. It does not start the app. `serve --host 0.0.0.0` exposes only the dashboard. Start, stop, park, and the rest live in the [docs](https://localslip.dev/docs).

## What you get

Named leases. A dashboard on **54321**. Firewall sync on Windows, macOS, and Linux. A documented Vite config that reads the claim and pins host and port.

Live data is `~/.localslip/`. First run copies `~/.localberth` if that folder still exists.

<!-- xfacts-label -->

## xFacts label

- **AppFacts:** [viewer](https://appfacts.dev/v#af1.eNpNUkFu2zAQ_ArBUwtIdprefGphIEhaJUCj3IqioKiNxJgiGe5KjmDk71lSqt2TgOHszOyOTnKSuy-FdGoAuZPWa2XRmiALSXNI0BEaoUIQn-r68TPDSIpG5AelyUzAiDUaHCbu96B0D-X15moh6oPcnaRVrhtVlwhPrFnraAIVop7AEhTih5rUP2xf1_zQg7WFuH26r1gmjo5MDvfgW9i8IGPPkeMefWR5ucj8NJQtZ2tcl4yUsUfj2qTID60i1aicsf5VGUqxe4-0kPPW8p1pEHiz3yfpGP2GWfkFt4csHtZjnM3Fs4-CehCtwr7xKrasscw2QASxxFfLXl_X4QARDRI4Ekg-8kWyQvCRhAVOh-d5WuNrxHV4XU2MZFhzvjDxbWVcbivgDTQTvcsG--pOYH5ggz-FbEZj21QMt3XgFH8H5fgTU0QXhlQ9ICXPfICSK-UiC6kNY6NrDWrrEdK2fMQBwtJtTxRwt92e_6FNC1MqEIJHwwvP_5E6Q_3YbLQftnvuxs5I5Y2PHZRVtb9IyPcPZOHjHg) · [raw](https://github.com/Catalyst-Forge-LLC/localslip/blob/main/APP_FACTS.md)

## Development

```bash
pnpm install
pnpm test
pnpm cli ls
```

Site (FilePress + docs mount): `pnpm --dir site ship`

Apache-2.0 · Catalyst Forge, LLC

[See the rest of the Catalyst Forge shelf.](https://catalystforge.com/tools/)
