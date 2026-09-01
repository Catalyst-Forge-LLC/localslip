# LocalSlip Smell Check overlay

Point at `smellcheck` (`node_modules/smellcheck/rules/core.md`). Do not fork core.

## Pronouns

| Surface | Voice |
| --- | --- |
| Site (`site/pages`, `site/posts`, `site/docs`) | **you** for the reader. Catalyst Forge is the footer, not a corporate we. |
| README, CLI help, flags | **you** / imperative. Terms of art stay. |
| Chat with the maintainer | **I** is fine. |

## Terms that pass here

- **slip / lease** — the product metaphor. A name owns a TCP port. Do not swap for “slot” or “reservation.”
- **localhost** — the loopback name and the pairing word. Not a metaphor to flatten.
- **Local DNS for ports** — the explainer line. Not real DNS. Do not “correct” it into “port registry” on public pages.
- **claim / get / release / scan / serve** — CLI verbs. **`--lan`** is the explicit open-past-loopback flag.
- **dashboard / board** — the local UI on 54321. Prefer these over “harbor board” on public pages (cozy machinery).
- **Tailscale, Vite, netsh, pf, ufw, firewalld** — other products or tools. Name them when they do a job.
- **LocalHelm / [localhelm.dev](https://localhelm.dev)** — sibling product. LocalSlip owns the lease; LocalHelm hosts start/stop on Ports. Link it. Do not fold the two products.

## Protected lines

- localhost is the machine. LocalSlip is the slip.
- Local DNS for ports.
- Earn the word. / Spray the prose, not the author. (package maxims)

## House extras

- Site copy follows `smellcheck` `landing.md`. Max 2 teaching antitheses (site vs dashboard; not a reverse proxy). Spend the pairing once per page. Public pages mention [LocalHelm](https://localhelm.dev) once, with a link. Do not ride “the wheel” through every heading. The npm README may keep it next to the pairing.
- Brand-metaphor budget: **slip** and **Local DNS for ports**. Do not ride harbor through every heading. Home may keep one `.dict` gloss of **slip** under the hero (noun: a boat's allotted place at a dock). The npm README may keep the same line as a blockquote. That is the definition, not a third heading.
- README is the npm page: short install, pointer to [docs](https://localslip.dev/docs). Flag lists live under `/docs`, not the README.
- “Harbor board” is house slang. Public pages say dashboard or board.
- Em dashes in `<title>` and meta: prefer a comma or colon.
