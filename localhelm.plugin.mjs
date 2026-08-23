/**
 * LocalBerth plugin for LocalHelm.
 * LocalHelm hosts the Ports tab; this file calls the sibling board (leases + observed).
 */
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const win = process.platform === 'win32';

function bridge() {
	const result = spawnSync(
		win ? 'pnpm.cmd' : 'pnpm',
		['exec', 'tsx', 'scripts/localhelm-bridge.ts'],
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
};

export default plugin;
