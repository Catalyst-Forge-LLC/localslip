import { isSelfDashboard, listenerOnLease, stopLease } from './lifecycle.js';
import { getLease, setParked } from './registry.js';
import { scanListeners } from './observe.js';
import type { Lease, Observed } from '../types.js';

export type ParkPlan = {
	writes: boolean;
	reason: string;
	stop: boolean;
};

export function planPark(lease: Lease, listeners: Observed[]): ParkPlan {
	if (isSelfDashboard(lease)) {
		return { writes: false, reason: 'refusing to park the dashboard you are using', stop: false };
	}
	if (lease.parked) {
		return { writes: false, reason: 'already parked — port stays yours', stop: false };
	}
	const hit = listenerOnLease(lease, listeners);
	if (hit) {
		return { writes: true, reason: 'stop and park — port stays yours', stop: true };
	}
	return { writes: true, reason: 'park — port stays yours', stop: false };
}

export function planUnpark(lease: Lease): { writes: boolean; reason: string } {
	if (!lease.parked) {
		return { writes: false, reason: 'not parked' };
	}
	return { writes: true, reason: 'unpark — start is separate' };
}

export async function parkLease(name: string): Promise<{ name: string; port: number; action: 'park' | 'skip'; reason: string }> {
	const lease = getLease(name);
	if (!lease) throw new Error(`no lease named "${name}"`);
	const planned = planPark(lease, await scanListeners());
	if (!planned.writes) {
		return { name: lease.name, port: lease.port, action: 'skip', reason: planned.reason };
	}
	if (planned.stop) {
		await stopLease(name);
	}
	const next = setParked(name, true);
	return { name: next.name, port: next.port, action: 'park', reason: planned.reason };
}

export async function unparkLease(name: string): Promise<{ name: string; port: number; action: 'unpark' | 'skip'; reason: string }> {
	const lease = getLease(name);
	if (!lease) throw new Error(`no lease named "${name}"`);
	const planned = planUnpark(lease);
	if (!planned.writes) {
		return { name: lease.name, port: lease.port, action: 'skip', reason: planned.reason };
	}
	const next = setParked(name, false);
	return { name: next.name, port: next.port, action: 'unpark', reason: planned.reason };
}
