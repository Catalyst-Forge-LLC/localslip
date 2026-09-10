---
title: LocalSlip
description: Named local port registry for development apps.
---

<aside class="dict">
<p><strong>slip</strong> <span class="pos">n.</span> a boat's allotted place at a dock.</p>
</aside>

Give local development apps stable, named port assignments. LocalSlip lets your CLI or supported app integration look up the intended port instead of relying on startup order.

You start a Svelte app. Vite takes **5173**. You start a second one. It takes **5174**. After a reboot you start them in the other order. The ports swap. Bookmarks, firewall rules, and the phone now hit the wrong app.

Name the port so that does not happen. `foo` stays on 5173. `bar` stays on 5174. An agent or the app asks the CLI instead of hoping Vite picked the same number again.

```text
localslip claim foo --port 5173
localslip claim bar --port 5174
localslip get foo
```

**localhost** is the machine. **LocalSlip** is the slip. The mechanism is a named registry on this computer (`~/.localslip/`). It is not DNS, not a reverse proxy, and not an OS port reservation. You still type the port.

Start and stop also live on [LocalHelm](https://localhelm.dev). Claim, release, and firewall stay here.

A claim records loopback (`127.0.0.1`) unless you pass `--lan`. `--lan` stores bind `0.0.0.0` and tries to add an inbound firewall allow. It does not start the app or bind the app's socket. The app must honor the stored host and port.

After you install, `localslip serve` opens the dashboard at `http://127.0.0.1:54321`.

[Docs](/docs) · [Install](/install) · [LocalHelm](https://localhelm.dev)
