---
title: Install
---

Requires **Node.js 20+**.

## Global install

```bash
npm i -g localslip
```

or `pnpm add -g localslip`.

Then:

```bash
localslip claim foo --port 5173
localslip serve
```

The dashboard is `http://127.0.0.1:54321`. Leases live in `~/.localslip/` on the machine that ran the CLI.

## From a checkout

```bash
pnpm install
pnpm cli ls
```

`setup.bat` then `run.bat` also works. The dashboard from the tree is `pnpm dev` (Vite). The published CLI is `localslip serve`.

## Site and docs

This documentation is [localslip.dev/docs](https://localslip.dev/docs). Product pages live on FilePress; these docs are a path mount at `/docs`.
