<p align="center">
  <img src="https://raw.githubusercontent.com/Catalyst-Forge-LLC/localslip/main/site/static/logo.png" alt="LocalSlip" width="218" />
</p>

# LocalSlip

**Local DNS for ports.**

> **slip** *n.* *a boat's allotted place at a dock.*

Vite hands out 5173, then 5174. Reboot, and they swap. Name the port so they do not.

**localhost** is the machine; **LocalSlip** is the slip. [LocalHelm](https://localhelm.dev) is the wheel.

Formerly **LocalBerth**. The `localberth` binary still works.

**Docs:** [localslip.dev/docs](https://localslip.dev/docs) · **Site:** [localslip.dev](https://localslip.dev)

## Install

```bash
npm i -g localslip
localslip claim foo --port 5173
localslip serve
```

or `pnpm add -g localslip`. Node.js 20+.

## Quick start

```bash
localslip claim foo --port 5173
localslip claim bar --port 5174
localslip get foo
localslip serve --host 0.0.0.0
```

`get` prints only the port, for scripts. `--lan` binds `0.0.0.0` and syncs an inbound firewall allow. Start, stop, park, and the rest live in the [docs](https://localslip.dev/docs).

## What you get

Named leases. A dashboard on **54321**. Firewall sync on Windows, macOS, and Linux. A Vite helper that pins host and port.

Live data is `~/.localslip/`. First run copies `~/.localberth` if that folder still exists.

<!-- xfacts-nutrition-label -->

## Nutrition label

- **AppFacts:** [viewer](https://appfacts.dev/v#af1.eNpNUkuP1DAM_iuRTyClUx63nkAjIR4FCbo3hJCbetts0yTE7sxWo_nvKJmyy9X5Xv6cC5ygea3B40LQgAsGXU9JJtAgW8yzM_UKY1Qvuu7HS9DAgrIyNIBG7IlAg7OGPGfs-4hmourN4dUNaGZoLuDQjyuOGXC3RepMslG06k7khLT6jCf8Nzt2nVbdRM5p9fHuawsa0urFlnTfwkCHBwYN9wkXOoc0QwM3mS9WiuXmrB-zEVp3tn7IiqBhQMEeS8bue2slx54Cyw1c1oarhoEiQ_PzAh4aeMdF-YHruYjHvYwnc3UfkpKJ1IA89QHTAFd94_YkQqniP84Kvd3JkRJbFvKiWELCkYpCDEmUI2TiJ77s8Q3zTt5XU6tYZ2V7RvLjjnjuVtEjmVVs8MXg2H5SXB4Yrr809Kt1Qz5MRDPjSL8X9DhSyhF9XPLpiSV7lgIqM5GZcz2JYmArIW3QwCQSuanr0cq09gcTlvqIgm5jqT6ENFLVtsf6vx91_QtkIdFS) · [raw](https://github.com/Catalyst-Forge-LLC/localslip/blob/main/APP_FACTS.md)

## Development

```bash
pnpm install
pnpm test
pnpm cli ls
```

Site (FilePress + docs mount): `pnpm --dir site ship`

Apache-2.0 · Catalyst Forge, LLC
