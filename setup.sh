#!/usr/bin/env bash
set -euo pipefail
pnpm install
node scripts/ensure-lease.mjs localslip-site 5187
