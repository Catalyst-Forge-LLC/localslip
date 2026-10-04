# Slip HUD — board and Deck

**Spec kind:** Visual  
**Status:** Locked (2026-10-04)  
**Related:** LocalHelm `docs/specs/bridge-header.md` (locked), `app/src/lib/helm-hud.css`, `app/src/lib/VisitorFace.svelte`, `app/src/lib/VisitorTile.svelte`  
**Surfaces:** `localslip serve` HTML in `src/lib/server/serve.ts`, and the Svelte board in `src/routes/+page.svelte`

Pairing: **localhost is the machine. LocalSlip is the slip. LocalHelm is the wheel.** This spec puts the slip’s board and Deck in the same sea-space-punk HUD LocalHelm already ships. It does not add a bridge, lamps, or a keel. Those belong to fleet facts LocalSlip does not have.

---

## 1. Problem

LocalSlip still wears the paper dashboard:

| Piece | Today |
| ----- | ----- |
| Page | Cream `#faf8f3`, ink `#1a1917`, teal `#2a6f6a` |
| Header | Solid black bar, system sans “LocalSlip” |
| Deck tiles | White cards, warm border, black `:port` band |
| Stations | Leases / Observed, teal underline |
| Tables | White panel, pill filter chips |
| Footer | Black band |
| Tooltips | Ink plate, theme `slip` |

LocalHelm’s operator board and Deck moved off that generation: dark hull, chart-paper grid, corner brackets, cyan for what is live, gold for a write that is waiting. The Deck is frosted glass with a short lift. LocalSlip’s phone tiles and the lease table read as the previous product.

**Two skins, one product.** `localslip serve` paints HTML from `FACE_CSS` inside `src/lib/server/serve.ts`. `pnpm dev` paints `src/app.css`, `BoardHeader.svelte`, `VisitorTile.svelte`, and Tailwind on `+page.svelte`. A pass that restyles only the Svelte tree leaves the published dashboard cream.

---

## 2. Goals

1. One palette, copied from LocalHelm’s HUD tokens. No second set of hex values.
2. Deck tiles match Helm’s glass plates: chart hull behind them, corner brackets, cyan port band, lift on hover.
3. The operator board uses the same hull, stations, and panel chrome. Leases and Observed stay the job.
4. Both renderers (`serve.ts` and the Svelte board) consume one stylesheet.
5. Behavior stays: loopback Host is the board, any other Host is the Deck, long-press copies, Open reuses one tab, filters and sort stay.

### Non-goals

- A LocalHelm bridge (ident / situation / conn / keel). No fleet counts, Refresh, Pull, or Push on this board.
- New APIs, new persist, gauges, radar, scanlines, or a clock.
- Steampunk: gears, rivets, pipes, Victorian serif, brass-for-brass.
- Renaming CLI verbs, lease fields, or the stations Leases and Observed.
- Restyling localslip.dev. The site stays as it is.
- Operator tables on the Deck. The phone face stays a tile grid.

---

## 3. Voice

Sea-space-punk, as locked on the Helm bridge: a ship’s bridge drawn as a HUD. LocalSlip borrows the materials and leaves the Helm instruments behind.

| | Sea | Space | On LocalSlip |
| - | --- | ----- | ------------ |
| Hull | dark navy, chart paper | faint cyan grid | both faces |
| Frames | brass corner fittings | thin cyan ticks, not full boxes | header, panels, tiles |
| Live marks | running lights | cyan `#7ef4ff` | listening, active station, `:port`, host line |
| Waiting marks | engine telegraph | gold `#c9a227` / `#fde68a` | conflict, mismatch, firewall still pending |
| Broken | alarm | `#f87171` | peek/bind errors already called danger |
| Words | slip, deck, lease | none on the glass | “Deck” on the phone face only |

**Cyan is for live. Gold is for something waiting. Red is for broken.** No new hue. The teal accent and the cream page retire on these two faces.

Leave off the glass: bay labels (“BRIDGE”, “SITUATION”), cosplay button names, fake instruments, hull glow, page gradients. Glow only on a light that is on: the port band, the active station, a hovered tile, a gold waiting mark.

Operator labels stay plain English. “Deck” is the phone face, the same word Helm uses. Internal class names may say `deck` and `hud`. Do not rename Leases or Observed.

---

## 4. Tokens

Duplicate the custom properties from LocalHelm `app/src/lib/helm-hud.css`. Do not import that file and do not depend on the localhelm package.

| Token | Value | Use |
| ----- | ----- | --- |
| `--hull` | `#03060c` | page |
| `--hull-2` | `#1c1c21` | tooltip fill |
| `--well` | `#060a13` | table panel, recessed bits |
| `--steel` | `#3a5a70` | tile border, footer rule |
| `--gold` / `--gold-soft` | `#c9a227` / `#fde68a` | waiting |
| `--cyan` | `#7ef4ff` | live |
| `--cyan-dim` / `--cyan-glow` | the Helm alphas | ticks, waterline, glow |
| `--grid` | cyan at 11% | chart lines |
| `--chart-size` | `1.25rem` | grid pitch |
| `--alarm` | `#f87171` | broken |
| `--dim` | `#a8a8b0` | secondary copy |
| `--glass-fill` | `rgb(12 22 40 / 0.52)` | Deck tiles and header plate |
| `--glass-blur` | `blur(14px) saturate(1.2)` | same |
| `--overlay-glow` | Helm’s three-layer shadow | tile hover, tooltip |
| `--hud-fade` | `0.125s` | hover only |
| `--font-mark` | Syne 700 | `SLIP`, `Deck` |
| `--font-tech` | Oxanium 600 | the word `local` in the lockup |

Body copy stays system sans. Ports, binds, and counts stay `ui-monospace`. Chart paper is `.slip-chart`: the same two 1px gradients Helm uses in `.helm-chart`, then `--hull`.

Corner brackets are `.hud-frame`, copied from Helm: eight 1px ticks, `--tick` about `0.7rem` on tiles and `0.85rem` on panels, drawn with background gradients. Bottom ticks inset by the corner radius so they sit on the curve.

**Lockup.** Operator header stacks Oxanium `local` over Syne `SLIP`, the same split as Helm’s `local` / `HELM`. `aria-label` and the document title stay LocalSlip. The mark stays `site/static/logo.png`. Do not redraw it.

---

## 5. Deck (any host that is not loopback)

Same job as today: hostname, copyable addresses, a grid of named leases that are listening past loopback, long-press or context menu copies the URL, click opens `localslip-open`.

### 5.1 Page

- Root is `.slip-chart`, `min-height: 100dvh`, column.
- Header is a glass plate: `--glass-fill`, blur, cyan bottom rule, soft cyan shadow. Corner brackets. Logo, then the word **Deck** in `--font-mark`, uppercase, cyan, a short text-shadow. Hostname and addresses stay buttons that copy. Dim ink, cyan on hover.
- Grid stays 2 columns, 3 from `640px`, gap `0.75rem`.
- Empty state keeps the current sentence (nothing past loopback, `--lan` or all interfaces). `code` is cyan.
- Footer: Catalyst Forge, localslip.dev, Docs. Dim ink, `--steel` top rule, hull behind it. Safe-area padding stays.

### 5.2 Tile

Match Helm `VisitorTile.svelte`. Behavior LocalSlip already has stays.

| | |
| - | - |
| Plate | `.hud-frame`, `--hud-fill: var(--glass-fill)`, 1px `--steel` border, inset cyan hairline, drop shadow |
| Face | cyan wash from the top, fading out |
| Icon well | 3rem, plate radius, cyan wash. Letter until the image loads |
| Title | one line, ellipsis. “Copied” for 1.2s after a copy, as today |
| Band | `:port` in mono, cyan, on a dark strip with a cyan top rule |
| Hover | lift `0.22rem`, brighter glass, `--overlay-glow`, band shifts to `--gold-soft` |
| Here | the current dashboard, when shown. No link, no lift. Band reads “This app” |
| Motion | transitions use `--hud-fade`. `prefers-reduced-motion: reduce` kills the lift and the transitions |

---

## 6. Operator board (loopback Host)

Facts stay: leases, observed listeners, filters, sort, expand, peek, Open, system-port toggle. Chrome changes.

### 6.1 Header

One row, same facts as `BoardHeader` / `brandHeader`. Glass plate and corner brackets, chart hull behind the page. Lockup from §4. Hostname and addresses copy, as today. The `:54321` note and the system-port link sit in the row as dim meta; the link is cyan.

Do not grow the row into a bridge. The shell is `100dvh` with a scrolling table. Header height stays one wrapping line.

### 6.2 Stations

Leases and Observed are stations, not cream tabs.

- Tracked uppercase, dim when idle.
- Active: cyan label, 2px cyan underline, count in mono.
- Counts stay the numbers already on the tabs.

### 6.3 Filters

Chips are small plates, not pills. Steel border, dim label. Pressed: cyan edge and cyan text. Listen, bind, and lease words stay. Firewall chips read Allowed, Needs admin, Private, and Pending.

### 6.4 Table

- Panel: `--well`, corner brackets, 1px `--steel`. Sticky header on `--well`.
- Header labels stay uppercase and tracked.
- Listening yes: cyan. Not listening: dim.
- Conflict or bind mismatch: gold text, and a 2px gold tick on the row’s inline start. Do not paint the whole row.
- Firewall pending and needs admin: gold. Allowed, private, and no rule: dim. A skipped claim that is not loopback reads "no rule".
- Row hover: a low cyan wash.
- Expanded facts: mono, dim labels, same well. Warn lines use `--gold-soft`.
- Open control: cyan. One tab, unchanged.

### 6.5 Tooltips

Theme `slip` becomes a HUD plate: `--hull-2` fill, corner ticks, `--overlay-glow`, 125ms fade. Tippy stays. Native `title` stays unused.

---

## 7. Tone map

Reuse Helm’s rule. Map the marks LocalSlip already computes.

| Fact | Tone |
| ---- | ---- |
| Listening, active station, port band, copy hover | cyan |
| Conflict, wider/narrower/other bind, firewall pending or needs admin | gold |
| Peek error, failed recipe health | alarm |
| Idle copy, allowed firewall, private, not listening | dim |

No green “ok”. The old `--accent` teal does not survive on these faces.

---

## 8. One stylesheet, two renderers

`src/lib/slip-hud.css` holds the tokens, `.slip-chart`, `.hud-frame`, header, lockup, Deck tile, footer, station, panel, and chip rules.

| Renderer | How it loads the sheet |
| -------- | ---------------------- |
| Svelte (`src/routes/+layout.svelte`) | import the file. Components use the classes. Tailwind stays for layout (flex, grid, scroll) and drops cream color utilities |
| `localslip serve` | read the same file and inject it into both HTML documents. Delete the hex block in `FACE_CSS` |

Fonts: `@fontsource/syne` and `@fontsource/oxanium`, same weights Helm uses. The CLI serves the woff files the way it already serves Tippy (`/vendor/…`). If a font 404s, the stacks in the tokens still render.

Do not hand-copy a second palette into the HTML string. The next HUD tweak should land in one file and show up in both faces.

---

## 9. Guardrails

| # | Guardrail |
| - | --------- |
| G1 | Both faces. A cream `serve` page with a dark `pnpm dev` page is a failed pass. |
| G2 | Deck stays a tile grid. No lease table, no peek, no filter chips on the phone. |
| G3 | Board stays loopback-Host only. This spec does not widen who sees Leases. |
| G4 | Header stays one wrapping row. No keel, no lamps, no conn controls. |
| G5 | Glow only on live or waiting marks (§3). The hull does not glow. |
| G6 | `prefers-reduced-motion: reduce` disables tile lift and hover transitions. |
| G7 | Tokens, not new literals, in component CSS. Layout Tailwind may stay. |
| G8 | Copy, Open, sort, filter, expand, and the system-port toggle behave as they do now. |

---

## 10. Acceptance

1. `localslip serve` on `127.0.0.1` shows the chart hull, the `local` / `SLIP` lockup, cyan station underline, well table, gold conflict tick.
2. The same process on a Tailscale or LAN Host shows Deck: glass tiles, cyan `:port` band, lift on hover, empty copy when nothing is past loopback.
3. `pnpm dev` matches those two faces. Diff the two by eye on the same viewport.
4. Long-press still copies. Open still uses one tab. A loopback Host still gets `/api/board`. Any other Host still gets 403.
5. Reduced motion: tiles do not move.
6. No steampunk chrome. No renamed stations. No bridge instruments.

---

## 11. When this is locked

Build only after this file says Locked and the operator asks.

1. Add `slip-hud.css` and the two font packages.
2. Point `+layout.svelte` at it. Restyle `BoardHeader`, `VisitorTile`, `SiteFooter`, `FilterBar`, `SortHead`, and the table in `+page.svelte`.
3. Inject the sheet from `serve.ts`. Remove the cream `FACE_CSS` colors. Keep the visitor and operator markup behavior.
4. Restyle the Tippy `slip` theme.
5. Browser-check both faces on the CLI server and on `pnpm dev`, desktop and a 390px width. Confirm reduced motion.
6. Note the lock in `CONTEXT_PROMPT.md`.
