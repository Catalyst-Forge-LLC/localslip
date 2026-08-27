/**
 * LocalSlip plugin for LocalHelm.
 * LocalHelm hosts the Ports tab; this file calls the sibling board and plan/apply.
 */
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const win = process.platform === 'win32';
const ACTIONS = new Set([
	'start',
	'stop',
	'park',
	'unpark',
	'recipe',
	'recipe-all',
	'quiet',
	'family-start',
	'family-stop',
]);

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
	if (!text) throw new Error(stderr || `localslip bridge failed (exit ${result.status})`);
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(stderr || `localslip bridge returned non-JSON:\n${text.slice(0, 400)}`);
	}
}

const plugin = {
	id: 'localslip',
	label: 'Ports',
	async board() {
		const boards = bridge();
		if (!Array.isArray(boards)) throw new Error('localslip bridge did not return boards');
		return boards;
	},
	async plan(action, ids) {
		if (!ACTIONS.has(action)) {
			throw new Error(`localslip plugin does not plan ${action}`);
		}
		const args = ['plan', '--action', action];
		if (ids.length) args.push('--names', ids.join(','));
		return bridge(args);
	},
	async apply(action, ids) {
		if (!ACTIONS.has(action)) {
			throw new Error(`localslip plugin does not apply ${action}`);
		}
		const args = ['apply', '--action', action];
		if (ids.length) args.push('--names', ids.join(','));
		return bridge(args);
	},
};

export default plugin;
