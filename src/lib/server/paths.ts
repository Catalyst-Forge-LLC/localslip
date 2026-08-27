import { cpSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export { DASHBOARD_NAME, DASHBOARD_PORT } from '../reserved.js';

const DIR_NAME = '.localslip';
const LEGACY_DIR_NAME = '.localberth';
const DB_FILE = 'localslip.sqlite';
const LEGACY_DB_FILE = 'localberth.sqlite';

function envHome(): string | undefined {
	return process.env.LOCALSLIP_HOME?.trim() || process.env.LOCALBERTH_HOME?.trim() || undefined;
}

function ensureDbName(dir: string): void {
	const next = join(dir, DB_FILE);
	const prev = join(dir, LEGACY_DB_FILE);
	if (!existsSync(next) && existsSync(prev)) {
		renameSync(prev, next);
	}
}

/** Resolve the data root. Create + one-shot copy only when `create` is true. */
export function resolveDataRoot(opts: { create?: boolean } = {}): string {
	const override = envHome();
	if (override) {
		if (opts.create) {
			mkdirSync(override, { recursive: true });
			ensureDbName(override);
		}
		return override;
	}
	const dest = join(homedir(), DIR_NAME);
	const legacy = join(homedir(), LEGACY_DIR_NAME);
	if (opts.create && !existsSync(dest) && existsSync(legacy)) {
		cpSync(legacy, dest, { recursive: true });
	}
	if (opts.create) {
		mkdirSync(dest, { recursive: true });
		ensureDbName(dest);
	}
	return dest;
}

export function dataHome(): string {
	return resolveDataRoot({ create: true });
}

export function dbPath(): string {
	return join(dataHome(), DB_FILE);
}

export function logPath(name: string): string {
	const dir = join(dataHome(), 'logs');
	mkdirSync(dir, { recursive: true });
	return join(dir, `${name}.log`);
}
