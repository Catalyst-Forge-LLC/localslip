import { familyMemberNames } from './family.js';
import { isQuietSite } from './quiet.js';
import { planPark, planUnpark } from './server/park.js';
import { planStart, planStop } from './server/lifecycle.js';
import { proposeRecipe } from './server/recipeGuess.js';
import { recipeFor } from './server/registry.js';
import type { Board } from './server/board.js';

export type HelmLifecycleAction =
	| 'start'
	| 'stop'
	| 'park'
	| 'unpark'
	| 'recipe'
	| 'recipe-all'
	| 'quiet'
	| 'family-start'
	| 'family-stop'
	| 'claim';

export type HelmLifecyclePlanRow = {
	id: string;
	writes: boolean;
	action: 'start' | 'stop' | 'park' | 'unpark' | 'recipe' | 'claim' | 'skip';
	reason: string;
	port: number;
	host: string;
	listening: boolean;
	recipe: string | null;
	proposedCwd?: string;
	proposedCommand?: string;
};

export type HelmLifecyclePlan = {
	action: HelmLifecycleAction;
	rows: HelmLifecyclePlanRow[];
};

function startStopAction(action: HelmLifecycleAction): 'start' | 'stop' | null {
	if (action === 'start' || action === 'family-start') return 'start';
	if (action === 'stop' || action === 'family-stop') return 'stop';
	return null;
}

function wantedNames(board: Board, action: HelmLifecycleAction, ids: string[]): Set<string> | null {
	if (!ids.length) return null;
	if (action !== 'family-start' && action !== 'family-stop') return new Set(ids);
	const names = board.leaseRows.map((row) => row.lease?.name).filter((name): name is string => Boolean(name));
	const expanded = new Set<string>();
	for (const seed of ids) {
		for (const name of familyMemberNames(seed, names)) {
			const lease = board.leaseRows.find((row) => row.lease?.name === name)?.lease;
			if (lease?.parked) continue;
			expanded.add(name);
		}
	}
	return expanded;
}

export function helmLifecyclePlan(board: Board, action: HelmLifecycleAction, ids: string[]): HelmLifecyclePlan {
	if (action === 'claim') {
		const names = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
		const known = new Map(
			board.leaseRows
				.map((row) => row.lease)
				.filter((lease): lease is NonNullable<typeof lease> => Boolean(lease))
				.map((lease) => [lease.name, lease]),
		);
		return {
			action,
			rows: names.map((name) => {
				const existing = known.get(name);
				if (existing) {
					return {
						id: name,
						writes: false,
						action: 'skip',
						reason: `already claimed :${existing.port}`,
						port: existing.port,
						host: existing.bind,
						listening: false,
						recipe: existing.startCommand,
					};
				}
				return {
					id: name,
					writes: true,
					action: 'claim',
					reason: `localslip claim ${name} --or-next`,
					port: 0,
					host: '127.0.0.1',
					listening: false,
					recipe: null,
				};
			}),
		};
	}
	const want = wantedNames(board, action, ids);
	const rows: HelmLifecyclePlanRow[] = [];
	const life = startStopAction(action);
	for (const row of board.leaseRows) {
		const lease = row.lease;
		if (!lease) continue;
		if (want && !want.has(lease.name)) continue;
		let writes = false;
		let nextAction: HelmLifecyclePlanRow['action'] = 'skip';
		let reason = '';
		let proposedCwd: string | undefined;
		let proposedCommand: string | undefined;

		if (life === 'start') {
			const planned = planStart(lease, board.observed);
			writes = planned.writes;
			nextAction = writes ? 'start' : 'skip';
			reason = planned.reason;
			proposedCwd = planned.proposedCwd;
			proposedCommand = planned.proposedCommand;
		} else if (life === 'stop') {
			const planned = planStop(lease, board.observed);
			writes = planned.writes;
			nextAction = writes ? 'stop' : 'skip';
			reason = planned.reason;
		} else if (action === 'park') {
			const planned = planPark(lease, board.observed);
			writes = planned.writes;
			nextAction = writes ? 'park' : 'skip';
			reason = planned.reason;
		} else if (action === 'unpark') {
			const planned = planUnpark(lease);
			writes = planned.writes;
			nextAction = writes ? 'unpark' : 'skip';
			reason = planned.reason;
		} else if (action === 'recipe' || action === 'recipe-all') {
			if (recipeFor(lease)) {
				reason = 'recipe already stored';
			} else {
				const guess = proposeRecipe(lease.name);
				if (!guess) {
					reason = `no matching folder — localslip recipe ${lease.name} --cwd PATH`;
				} else {
					writes = true;
					nextAction = 'recipe';
					reason = `save ${guess.command}`;
					proposedCwd = guess.cwd;
					proposedCommand = guess.command;
				}
			}
		} else if (action === 'quiet') {
			if (!isQuietSite(lease, row.listening)) {
				reason = lease.name.endsWith('-site') ? 'site not listening' : 'not a site lease';
			} else {
				const planned = planStop(lease, board.observed);
				writes = planned.writes;
				nextAction = writes ? 'stop' : 'skip';
				reason = planned.reason;
			}
		}

		rows.push({
			id: lease.name,
			writes,
			action: nextAction,
			reason,
			port: lease.port,
			host: lease.bind,
			listening: row.listening,
			recipe: lease.startCwd
				? lease.startCommand || 'pnpm serve'
				: proposedCommand ?? null,
			proposedCwd,
			proposedCommand,
		});
	}
	return { action, rows };
}
