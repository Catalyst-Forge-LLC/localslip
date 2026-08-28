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

- **AppFacts:** [viewer](https://appfacts.dev/v#af1.eNpNUkFu2zAQ_ArBUwtIdprefGphIEhaJUCj3IqioKiNxJgiGe5KjmDk71lSqt2TgOHszOyOTnKSuy-FdGoAuZPWa2XRmiALSXNI0BEaoUIQn-r68TPDSIpG5AelyUzAiDUaHCbu96B0D-X15moh6oPcnaRVrhtVlwhPrFnraAIVop7AEhTih5rUP2xf1_zQg7WFuH26r1gmjo5MDvfgW9i8IGPPkeMefWR5ucj8NJQtZ2tcl4yUsUfj2qTID60i1aicsf5VGUqxe4-0kPPW8p1pEHiz3yfpGP2GWfkFt4csHtZjnM3Fs4-CehCtwr7xKrasscw2QASxxFfLXl_X4QARDRI4Ekg-8kWyQvCRhAVOh-d5WuNrxHV4XU2MZFhzvjDxbWVcbivgDTQTvcsG--pOYH5ggz-FbEZj21QMt3XgFH8H5fgTU0QXhlQ9ICXPfICSK-UiC6kNY6NrDWrrEdK2fMQBwtJtTxRwt92e_6FNC1MqEIJHwwvP_5E6Q_3YbLQftnvuxs5I5Y2PHZRVtb9IyPcPZOHjHg) · [raw](https://github.com/Catalyst-Forge-LLC/localslip/blob/main/APP_FACTS.md)

## Development

```bash
pnpm install
pnpm test
pnpm cli ls
```

Site (FilePress + docs mount): `pnpm --dir site ship`

Apache-2.0 · Catalyst Forge, LLC
