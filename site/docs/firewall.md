---
title: Firewall
---

A loopback claim does not open a WAN hole. `--lan` binds `0.0.0.0` and tries to add an inbound allow.

```bash
localslip claim foo --port 5173 --lan
localslip firewall sync
localslip firewall status
```

Rules are named `LocalSlip <name> <port>`. Only those are removed on release or move.

## Privilege

Firewall writes need admin or root. Without that, the lease still saves and LocalSlip prints the command to paste. It does not prompt for UAC or sudo.

Backends: `netsh` on Windows, `pf` on macOS, `ufw` or `firewalld` on Linux.

## On the board

The Firewall column is the claim, not the Deck. Stored values stay `skipped`, `wanted`, `needs-elevation`, and `applied`. The cells read:

| Cell | Meaning |
| --- | --- |
| private | Loopback claim. No inbound rule. |
| no rule | The claim is past loopback and no allow was installed. |
| pending | An inbound allow is still due. |
| needs admin | The allow needs an Administrator terminal. `localslip firewall sync` prints the command. |
| allowed | The inbound allow is installed. |

## Bind vs listen

The claim can stay on `127.0.0.1` while the app listens on all interfaces (`vite --host`). The visitor menu follows the **socket**, not the claim text. The firewall rule follows the claim: you still need `--lan` (or a pasted rule) if the phone should get through the host firewall.
