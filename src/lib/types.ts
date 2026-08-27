export type LeaseKind = 'always' | 'ephemeral';
export type FirewallStatus = 'wanted' | 'applied' | 'needs-elevation' | 'skipped';

export type Lease = {
	name: string;
	port: number;
	bind: string;
	protocol: 'tcp';
	kind: LeaseKind;
	notes: string;
	firewall: FirewallStatus;
	updatedAt: string;
	/** Absolute cwd for `localslip start`. Null/omit = no recipe. */
	startCwd?: string | null;
	/** Shell command; default `pnpm serve` when cwd is set. */
	startCommand?: string | null;
	/** PID LocalSlip last spawned. Null if never started here or already cleared. */
	spawnPid?: number | null;
	/** Hidden on the default board. Port stays claimed. */
	parked?: boolean;
};

export type Observed = {
	port: number;
	bind: string;
	pid: number | null;
	process: string | null;
	seenAt: string;
	leaseName: string | null;
};

export type BoardRow = {
	lease: Lease | null;
	observed: Observed | null;
	listening: boolean;
	conflict: boolean;
	/** Other listeners on the same port (different process). */
	also: Observed[];
	/** Last log lines for a named lease. Filled by getBoard. */
	logTail?: { preview: string; text: string };
};
