import { DASHBOARD_NAME } from './reserved.js';
import type { Lease } from './types.js';

/** Listening *-site leases. Skips the dashboard. Always-kind sites still quiet — that is the meeting button. */
export function isQuietSite(lease: Lease, listening: boolean): boolean {
	if (!listening || lease.parked) return false;
	if (!lease.name.endsWith('-site')) return false;
	if (lease.name === DASHBOARD_NAME) return false;
	return true;
}

export function quietSiteNames(rows: { lease: Lease | null; listening: boolean }[]): string[] {
	return rows
		.filter((row) => row.lease && isQuietSite(row.lease, row.listening))
		.map((row) => row.lease!.name);
}
