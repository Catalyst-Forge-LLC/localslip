import { spawn, spawnSync } from 'node:child_process';
import { existsSync, openSync } from 'node:fs';
import { DASHBOARD_NAME } from './paths.js';
import { logPath } from './paths.js';
import { scanListeners } from './observe.js';
import { getLease, recipeFor, setSpawnPid, setStartRecipe } from './registry.js';
import type { Lease, Observed } from '../types.js';

export type LifecycleAction = 'start' | 'stop' | 'skip';

export type LifecycleResult = {
	name: string;
	port: number;
	action: LifecycleAction;
	pid: number | null;
	listening: boolean;
	reason: string;
};

function isPidAlive(pid: number): boolean {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	if (process.platform === 'win32') {
		const result = spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], {
			encoding: 'utf8',
			windowsHide: true
		});
		const out = (result.stdout ?? '').trim();
		return Boolean(out) && !/^INFO:/i.test(out) && out.includes(String(pid));
	}
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export function killProcessTree(pid: number): void {
	if (process.platform === 'win32') {
		spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true });
		return;
	}
	try {
		process.kill(-pid, 'SIGTERM');
	} catch {
		try {
			process.kill(pid, 'SIGTERM');
		} catch {
			/* already gone */
		}
	}
}

export function listenerOnLease(lease: Lease, listeners: Observed[]): Observed | null {
	return listeners.find((row) => row.port === lease.port) ?? null;
}

export function isSelfDashboard(lease: Lease): boolean {
	const helm = Number(process.env.LOCALHELM_PORT);
	if (Number.isInteger(helm) && helm === lease.port) return true;
	const berth = Number(process.env.LOCALBERTH_PORT);
	return Number.isInteger(berth) && berth === lease.port;
}

export function planStart(lease: Lease, listeners: Observed[]): { writes: boolean; reason: string } {
	if (!recipeFor(lease)) {
		return {
			writes: false,
			reason: `no recipe yet — localberth recipe ${lease.name} --cwd <folder>`
		};
	}
	const hit = listenerOnLease(lease, listeners);
	if (hit) {
		return {
			writes: false,
			reason: `already listening${hit.pid != null ? ` (pid ${hit.pid})` : ''}`
		};
	}
	return { writes: true, reason: `start ${recipeFor(lease)!.command}` };
}

export function planStop(lease: Lease, listeners: Observed[]): { writes: boolean; reason: string } {
	if (isSelfDashboard(lease)) {
		return { writes: false, reason: 'refusing to stop the dashboard you are using' };
	}
	const hit = listenerOnLease(lease, listeners);
	if (!hit && !(lease.spawnPid && isPidAlive(lease.spawnPid))) {
		return { writes: false, reason: 'not running' };
	}
	return { writes: true, reason: `stop pid ${hit?.pid ?? lease.spawnPid}` };
}

async function waitForListen(lease: Lease, tries = 20, delayMs = 250): Promise<Observed | null> {
	for (let i = 0; i < tries; i++) {
		const hit = listenerOnLease(lease, await scanListeners());
		if (hit) return hit;
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	return null;
}

export async function startLease(
	name: string,
	opts: { cwd?: string; command?: string } = {}
): Promise<LifecycleResult> {
	const lease0 = getLease(name);
	if (!lease0) throw new Error(`no lease named "${name}"`);
	if (opts.cwd !== undefined || opts.command !== undefined) {
		setStartRecipe(name, { cwd: opts.cwd, command: opts.command });
	}
	const lease = getLease(name)!;
	const listeners = await scanListeners();
	const planned = planStart(lease, listeners);
	if (!planned.writes) {
		const hit = listenerOnLease(lease, listeners);
		return {
			name: lease.name,
			port: lease.port,
			action: 'skip',
			pid: hit?.pid ?? lease.spawnPid ?? null,
			listening: Boolean(hit),
			reason: planned.reason
		};
	}
	const recipe = recipeFor(lease);
	if (!recipe) throw new Error(planned.reason);
	if (!existsSync(recipe.cwd)) {
		throw new Error(`start cwd missing: ${recipe.cwd}`);
	}

	const logFd = openSync(logPath(lease.name), 'a');
	const env = {
		...process.env,
		PORT: String(lease.port),
		HOST: lease.bind
	};
	const child =
		recipe.command === 'pnpm serve' || recipe.command === 'pnpm run serve'
			? spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['serve'], {
					cwd: recipe.cwd,
					env,
					detached: true,
					stdio: ['ignore', logFd, logFd],
					windowsHide: true,
					shell: process.platform === 'win32'
				})
			: spawn(recipe.command, {
					cwd: recipe.cwd,
					env,
					detached: true,
					stdio: ['ignore', logFd, logFd],
					windowsHide: true,
					shell: true
				});
	if (!child.pid) {
		throw new Error(`failed to start ${lease.name}: no pid`);
	}
	child.unref();
	setSpawnPid(lease.name, child.pid);
	const hit = await waitForListen(lease);
	return {
		name: lease.name,
		port: lease.port,
		action: 'start',
		pid: child.pid,
		listening: Boolean(hit),
		reason: hit
			? `listening pid ${hit.pid ?? child.pid}`
			: `started pid ${child.pid}; not listening yet (log ~/.localberth/logs/${lease.name}.log)`
	};
}

export async function stopLease(name: string, opts: { force?: boolean } = {}): Promise<LifecycleResult> {
	const lease = getLease(name);
	if (!lease) throw new Error(`no lease named "${name}"`);
	if (lease.name === DASHBOARD_NAME && !opts.force) {
		throw new Error('refusing to stop localberth (the dashboard). pass --force if you mean it');
	}
	if (isSelfDashboard(lease) && !opts.force) {
		throw new Error('refusing to stop the dashboard you are using. pass --force if you mean it');
	}
	const listeners = await scanListeners();
	const hit = listenerOnLease(lease, listeners);
	const pids = new Set<number>();
	if (lease.spawnPid && isPidAlive(lease.spawnPid)) pids.add(lease.spawnPid);
	if (hit?.pid) pids.add(hit.pid);
	if (pids.size === 0) {
		setSpawnPid(lease.name, null);
		return {
			name: lease.name,
			port: lease.port,
			action: 'skip',
			pid: null,
			listening: false,
			reason: 'not running'
		};
	}
	for (const pid of pids) killProcessTree(pid);
	setSpawnPid(lease.name, null);
	return {
		name: lease.name,
		port: lease.port,
		action: 'stop',
		pid: [...pids][0] ?? null,
		listening: false,
		reason: `stopped ${[...pids].join(', ') || 'process'}`
	};
}
