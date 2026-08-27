import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const LOG_TAIL_LINES = 40;

export type LogTail = {
	exists: boolean;
	lines: string[];
	preview: string;
	text: string;
};

const EMPTY = 'No log yet — start once.';

function logsDir(): string {
	const override = process.env.LOCALSLIP_HOME?.trim() || process.env.LOCALBERTH_HOME?.trim();
	const root = override || join(homedir(), '.localberth');
	return join(root, 'logs');
}

/** Read-only. Does not create ~/.localberth or the logs folder. */
export function readLogTail(name: string, maxLines = LOG_TAIL_LINES): LogTail {
	const file = join(logsDir(), `${name}.log`);
	if (!existsSync(file)) {
		return { exists: false, lines: [], preview: EMPTY, text: '' };
	}
	let raw = '';
	try {
		raw = readFileSync(file, 'utf8');
	} catch {
		return { exists: true, lines: [], preview: EMPTY, text: '' };
	}
	const trimmed = raw.replace(/\s+$/, '');
	if (!trimmed) {
		return { exists: true, lines: [], preview: EMPTY, text: '' };
	}
	const lines = trimmed.split(/\r?\n/).slice(-Math.max(1, maxLines));
	const last = [...lines].reverse().find((line) => line.trim()) ?? '';
	const preview = last.length > 48 ? `${last.slice(0, 45)}…` : last || EMPTY;
	return { exists: true, lines, preview, text: lines.join('\n') };
}
