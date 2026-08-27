import { getDb } from './server/db.js';
import { getLease } from './server/registry.js';

/** Resolve a lease to a TCP port. For Vite / app config: `server.port = localslipPort('foo', 5173)`. */
export function localslipPort(name: string, fallback?: number): number {
	return localslipListen(name, fallback).port;
}

/**
 * Host + port for Vite `server`. Pin `host` or Vite binds `localhost`, which on
 * Windows is often `[::1]` only while the claim stays `127.0.0.1`.
 */
export function localslipListen(
	name: string,
	fallbackPort?: number
): { host: string; port: number } {
	getDb();
	const lease = getLease(name);
	if (lease) return { host: lease.bind, port: lease.port };
	if (fallbackPort !== undefined) return { host: '127.0.0.1', port: fallbackPort };
	throw new Error(`localslip: no lease named "${name}"`);
}

/** @deprecated Use localslipListen. */
export const localberthListen = localslipListen;

/** @deprecated Use localslipPort. */
export const localberthPort = localslipPort;
