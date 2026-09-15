#!/usr/bin/env bash
set -euo pipefail
pnpm install
localslip claim localslip-site --port 5187
