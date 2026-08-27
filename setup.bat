@echo off
pnpm install
node scripts\ensure-lease.mjs localslip-site 5187
