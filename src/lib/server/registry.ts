import path from 'node:path';
import { getDb } from './db.js';
import { DASHBOARD_NAME, DASHBOARD_PORT } from './paths.js';
import type { FirewallStatus, Lease, LeaseKind } from './types.js';

const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
const ALWAYS_POOL = { lo: 46000, hi: 46999 };
const EPHEMERAL_POOL = { lo: 47000, hi: 47999 };

export const DEFAULT_START_COMMAND = 'pnpm serve';

type LeaseRow = {
	name: string;
	port: number;
	bind: string;
	protocol: 'tcp';
	kind: LeaseKind;
	notes: string;
	firewall: FirewallStatus;
	updated_at: string;
	start_cwd: string | null;
	start_command: string | null;
	spawn_pid: number | null;
};

function rowToLease(row: LeaseRow): Lease {
	return {
		name: row.name,
		port: row.port,
		bind: row.bind,
		protocol: row.protocol,
		kind: row.kind,
		notes: row.notes,
		firewall: row.firewall,
		updatedAt: row.updated_at,
		startCwd: row.start_cwd ?? null,
		startCommand: row.start_command ?? null,
		spawnPid: row.spawn_pid ?? null
	};
}

export function assertName(name: string): string {
	const n = name.trim().toLowerCase();
	if (!NAME_RE.test(n)) {
		throw new Error(`invalid name "${name}" — use lowercase letters, numbers, and hyphens`);
	}
	return n;
}

export function assertPort(port: number): number {
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(`invalid port ${port}`);
	}
	return port;
}

export function getLease(name: string): Lease | null {
	const row = getDb()
		.prepare('SELECT * FROM leases WHERE name = ?')
		.get(assertName(name)) as LeaseRow | undefined;
	return row ? rowToLease(row) : null;
}

export function listLeases(): Lease[] {
	const rows = getDb()
		.prepare('SELECT * FROM leases ORDER BY name')
		.all() as LeaseRow[];
	return rows.map(rowToLease);
}

export function leaseByPort(port: number): Lease | null {
	const row = getDb()
		.prepare('SELECT * FROM leases WHERE port = ?')
		.get(port) as LeaseRow | undefined;
	return row ? rowToLease(row) : null;
}

export function setFirewall(name: string, firewall: FirewallStatus): void {
	getDb()
		.prepare('UPDATE leases SET firewall = ?, updated_at = ? WHERE name = ?')
		.run(firewall, new Date().toISOString(), assertName(name));
}

function nextFreePort(kind: LeaseKind, taken: Set<number>): number {
	const pool = kind === 'ephemeral' ? EPHEMERAL_POOL : ALWAYS_POOL;
	for (let p = pool.lo; p <= pool.hi; p++) {
		if (p === DASHBOARD_PORT) continue;
		if (!taken.has(p)) return p;
	}
	throw new Error(`no free ports left in the ${kind} pool (${pool.lo}–${pool.hi})`);
}

export type ClaimInput = {
	name: string;
	port?: number;
	bind?: string;
	/** Shorthand for bind 0.0.0.0 (LAN + inbound firewall). */
	lan?: boolean;
	ephemeral?: boolean;
	notes?: string;
	/** If --port is leased or listening, take the next free pool port. */
	orNext?: boolean;
	/** Ports that are already listening (from scan). Pool allocation always skips these. */
	occupied?: number[];
	/** Optional start recipe. Omitted on reclaim leaves the existing recipe. */
	cwd?: string;
	command?: string;
};

/** Default is loopback. --lan opens 0.0.0.0. --bind and --lan together is an error. */
export function resolveClaimBind(input: { bind?: string; lan?: boolean }): string {
	const bind = input.bind?.trim();
	if (input.lan && bind) {
		throw new Error('use --lan or --bind, not both');
	}
	if (input.lan) return '0.0.0.0';
	return bind || '127.0.0.1';
}

export type ClaimResult = {
	lease: Lease;
	previous: Lease | null;
	fallbackFrom?: number;
};

export function claim(input: ClaimInput): ClaimResult {
	const name = assertName(input.name);
	const kind: LeaseKind = input.ephemeral ? 'ephemeral' : 'always';
	const bind = resolveClaimBind(input);
	const notes = input.notes?.trim() ?? '';
	const db = getDb();
	const previous = getLease(name);

	const taken = new Set(listLeases().filter((l) => l.name !== name).map((l) => l.port));
	const occupied = new Set(input.occupied ?? []);
	const avoid = new Set([...taken, ...occupied]);
	let fallbackFrom: number | undefined;
	let port: number;

	if (input.port !== undefined) {
		port = assertPort(input.port);
		const leased = taken.has(port);
		const listening = occupied.has(port) && previous?.port !== port;
		if (leased || (input.orNext && listening)) {
			if (!input.orNext) {
				const owner = leaseByPort(port);
				throw new Error(
					`port ${port} is already leased by ${owner?.name ?? 'another name'}` +
						` — pass --or-next to take a free port`
				);
			}
			fallbackFrom = port;
			port = nextFreePort(kind, avoid);
		}
	} else {
		port = nextFreePort(kind, avoid);
	}

	const now = new Date().toISOString();
	db.prepare(
		`INSERT INTO leases (name, port, bind, protocol, kind, notes, firewall, updated_at)
		 VALUES (?, ?, ?, 'tcp', ?, ?, 'wanted', ?)
		 ON CONFLICT(name) DO UPDATE SET
		   port = excluded.port,
		   bind = excluded.bind,
		   kind = excluded.kind,
		   notes = excluded.notes,
		   firewall = 'wanted',
		   updated_at = excluded.updated_at`
	).run(name, port, bind, kind, notes || previous?.notes || '', now);

	if (previous && previous.port !== port) setSpawnPid(name, null);
	if (input.cwd !== undefined || input.command !== undefined) {
		setStartRecipe(name, { cwd: input.cwd, command: input.command });
	}

	return { lease: getLease(name)!, previous, fallbackFrom };
}

export function setStartRecipe(
	name: string,
	input: { cwd?: string | null; command?: string | null }
): Lease {
	const n = assertName(name);
	const lease = getLease(n);
	if (!lease) throw new Error(`no lease named "${n}"`);
	const cwd = input.cwd === undefined ? lease.startCwd : normalizeCwd(input.cwd);
	const command =
		input.command === undefined
			? lease.startCommand
			: normalizeCommand(input.command);
	getDb()
		.prepare(
			`UPDATE leases SET start_cwd = ?, start_command = ?, updated_at = ? WHERE name = ?`
		)
		.run(cwd, command, new Date().toISOString(), n);
	return getLease(n)!;
}

export function setSpawnPid(name: string, pid: number | null): void {
	getDb()
		.prepare(`UPDATE leases SET spawn_pid = ?, updated_at = ? WHERE name = ?`)
		.run(pid, new Date().toISOString(), assertName(name));
}

function normalizeCwd(raw: string | null | undefined): string | null {
	if (raw == null) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	return path.resolve(trimmed);
}

function normalizeCommand(raw: string | null | undefined): string | null {
	if (raw == null) return null;
	const trimmed = raw.trim();
	return trimmed ? trimmed : null;
}

export function recipeFor(lease: Lease): { cwd: string; command: string } | null {
	if (!lease.startCwd) return null;
	return { cwd: lease.startCwd, command: lease.startCommand || DEFAULT_START_COMMAND };
}

export function release(name: string, opts: { force?: boolean } = {}): Lease {
	const n = assertName(name);
	if (n === DASHBOARD_NAME && !opts.force) {
		throw new Error('refusing to release localberth (the dashboard). pass --force if you mean it');
	}
	const lease = getLease(n);
	if (!lease) throw new Error(`no lease named "${n}"`);
	getDb().prepare('DELETE FROM leases WHERE name = ?').run(n);
	return lease;
}
