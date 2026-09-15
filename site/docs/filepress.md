---
title: FilePress
---

FilePress **reads** a lease. It does not claim. Name the site package the same as the slip, then:

```bash
localslip claim detangler-site --port 5203 && filepress dev --host 0.0.0.0
```

`claim` is idempotent. Do not pass `--port` to FilePress. `localslip ls` is the table.

Missing LocalSlip is not an error. Vite then uses 5173.

For Vite / SvelteKit apps that are not FilePress, use the [import](/docs/vite).
