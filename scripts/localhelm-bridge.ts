/**
 * JSON bridge so LocalHelm can host the Ports tab without reimplementing leases.
 * Invoked by localhelm.plugin.mjs in this repo.
 *
 *   (no args)                         → boards
 *   plan --action start|stop [--names a,b]
 *   apply --action start|stop [--names a,b]
 *
 * Must process.exit: start detaches a child, and tsx/sqlite handles can keep
 * this process alive. LocalHelm waits on spawnSync until we exit.
 */
import { helmLifecyclePlan } from '../src/lib/helm-plugin-plan.ts';
import { helmPluginBoards } from '../src/lib/helm-plugin-board.ts';
import { getBoard } from '../src/lib/server/board.ts';
import { getDb } from '../src/lib/server/db.ts';
import { startLease, stopLease } from '../src/lib/server/lifecycle.ts';

function takeOpt(args: string[], name: string): string | undefined {
	const i = args.indexOf(name);
	if (i < 0) return undefined;
	const value = args[i + 1];
	if (!value || value.startsWith('-')) throw new Error(`missing value for ${name}`);
	args.splice(i, 2);
	return value;
}

function parseAction(raw: string | undefined): 'start' | 'stop' {
	if (raw === 'start' || raw === 'stop') return raw;
	throw new Error('usage: plan|apply --action start|stop [--names a,b]');
}

async function main(): Promise<void> {
	getDb();
	const argv = process.argv.slice(2);
	const cmd = argv[0];

	if (!cmd) {
		const boards = helmPluginBoards(await getBoard());
		process.stdout.write(`${JSON.stringify(boards)}\n`);
		return;
	}
	if (cmd === 'plan' || cmd === 'apply') {
		const args = argv.slice(1);
		const action = parseAction(takeOpt(args, '--action'));
		const namesRaw = takeOpt(args, '--names');
		const ids = namesRaw ? namesRaw.split(',').map((id) => id.trim()).filter(Boolean) : [];
		const board = await getBoard();
		if (cmd === 'plan') {
			process.stdout.write(`${JSON.stringify(helmLifecyclePlan(board, action, ids))}\n`);
			return;
		}
		const plan = helmLifecyclePlan(board, action, ids);
		const results = [];
		for (const row of plan.rows) {
			if (!row.writes) {
				results.push({ id: row.id, action: 'skip', reason: row.reason, writes: false });
				continue;
			}
			const result =
				action === 'start' ? await startLease(row.id, { saveGuess: true }) : await stopLease(row.id);
			results.push({
				id: result.name,
				action: result.action,
				reason: result.reason,
				pid: result.pid,
				writes: result.action !== 'skip'
			});
		}
		process.stdout.write(`${JSON.stringify({ action, rows: results })}\n`);
		return;
	}
	throw new Error(`unknown localberth bridge command "${cmd}"`);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
		process.exit(1);
	});
