/**
 * JSON bridge so LocalHelm can host the Ports tab without reimplementing leases.
 * Invoked by localhelm.plugin.mjs in this repo.
 *
 *   (no args)                         → boards
 *   plan --action start|stop|park|unpark|recipe|family-start|family-stop [--names a,b]
 *   apply --action … [--names a,b]
 *
 * Must process.exit: start detaches a child, and tsx/sqlite handles can keep
 * this process alive. LocalHelm waits on spawnSync until we exit.
 */
import { helmLifecyclePlan, type HelmLifecycleAction } from '../src/lib/helm-plugin-plan.ts';
import { helmPluginBoards } from '../src/lib/helm-plugin-board.ts';
import { getBoard } from '../src/lib/server/board.ts';
import { getDb } from '../src/lib/server/db.ts';
import { startLease, stopLease } from '../src/lib/server/lifecycle.ts';
import { parkLease, unparkLease } from '../src/lib/server/park.ts';
import { saveGuessRecipe } from '../src/lib/server/recipe-save.ts';

const ACTIONS = new Set<HelmLifecycleAction>([
	'start',
	'stop',
	'park',
	'unpark',
	'recipe',
	'family-start',
	'family-stop',
]);

function takeOpt(args: string[], name: string): string | undefined {
	const i = args.indexOf(name);
	if (i < 0) return undefined;
	const value = args[i + 1];
	if (!value || value.startsWith('-')) throw new Error(`missing value for ${name}`);
	args.splice(i, 2);
	return value;
}

function parseAction(raw: string | undefined): HelmLifecycleAction {
	if (raw && ACTIONS.has(raw as HelmLifecycleAction)) return raw as HelmLifecycleAction;
	throw new Error(`usage: plan|apply --action ${[...ACTIONS].join('|')} [--names a,b]`);
}

async function applyRow(
	action: HelmLifecyclePlan['action'],
	id: string,
): Promise<{ id: string; action: string; reason: string; writes: boolean; pid?: number | null }> {
	if (action === 'start' || action === 'family-start') {
		const result = await startLease(id, { saveGuess: true });
		return { id: result.name, action: result.action, reason: result.reason, writes: result.action !== 'skip', pid: result.pid };
	}
	if (action === 'stop' || action === 'family-stop') {
		const result = await stopLease(id);
		return { id: result.name, action: result.action, reason: result.reason, writes: result.action !== 'skip', pid: result.pid };
	}
	if (action === 'park') {
		const result = await parkLease(id);
		return { id: result.name, action: result.action, reason: result.reason, writes: result.action !== 'skip' };
	}
	if (action === 'unpark') {
		const result = await unparkLease(id);
		return { id: result.name, action: result.action, reason: result.reason, writes: result.action !== 'skip' };
	}
	const result = saveGuessRecipe(id);
	return { id: result.name, action: result.action, reason: result.reason, writes: result.action !== 'skip' };
}

type HelmLifecyclePlan = ReturnType<typeof helmLifecyclePlan>;

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
			results.push(await applyRow(action, row.id));
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
