/**
 * LocalBerth plugin for LocalHelm.
 * LocalHelm hosts the Ports tab; this file calls the sibling board and start/stop.
 */
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const win = process.platform === 'win32';

function bridge(args = []) {
	const result = spawnSync(
		win ? 'pnpm.cmd' : 'pnpm',
		['exec', 'tsx', 'scripts/localhelm-bridge.ts', ...args],
		{ cwd: root, encoding: 'utf8', windowsHide: true, shell: win },
	);
	const stdout = result.stdout ?? '';
	const stderr = (result.stderr ?? '').trim();
	if (result.error) throw new Error(result.error.message);
	const text = stdout.trim();
	if (!text) throw new Error(stderr || `localberth bridge failed (exit ${result.status})`);
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(stderr || `localberth bridge returned non-JSON:\n${text.slice(0, 400)}`);
	}
}

const plugin = {
	id: 'localberth',
	label: 'Ports',
	async board() {
		const boards = bridge();
		if (!Array.isArray(boards)) throw new Error('localberth bridge did not return boards');
		return boards;
	},
	async plan(action, ids) {
		if (action !== 'start' && action !== 'stop') {
			throw new Error(`localberth plugin only plans start or stop (got ${action})`);
		}
		const args = ['plan', '--action', action];
		if (ids.length) args.push('--names', ids.join(','));
		return bridge(args);
	},
	async apply(action, ids) {
		if (action !== 'start' && action !== 'stop') {
			throw new Error(`localberth plugin only applies start or stop (got ${action})`);
		}
		const args = ['apply', '--action', action];
		if (ids.length) args.push('--names', ids.join(','));
		return bridge(args);
	},
};

export default plugin;
