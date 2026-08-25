import { planStart, planStop } from './server/lifecycle.js';
import type { Board } from './server/board.js';

export type HelmLifecycleAction = 'start' | 'stop';

export type HelmLifecyclePlanRow = {
	id: string;
	writes: boolean;
	action: 'start' | 'stop' | 'skip';
	reason: string;
	port: number;
	listening: boolean;
	recipe: string | null;
	proposedCwd?: string;
	proposedCommand?: string;
};

export type HelmLifecyclePlan = {
	action: HelmLifecycleAction;
	rows: HelmLifecyclePlanRow[];
};

export function helmLifecyclePlan(board: Board, action: HelmLifecycleAction, ids: string[]): HelmLifecyclePlan {
	const want = new Set(ids);
	const rows: HelmLifecyclePlanRow[] = [];
	for (const row of board.leaseRows) {
		const lease = row.lease;
		if (!lease) continue;
		if (want.size && !want.has(lease.name)) continue;
		const planned = action === 'start' ? planStart(lease, board.observed) : planStop(lease, board.observed);
		rows.push({
			id: lease.name,
			writes: planned.writes,
			action: planned.writes ? action : 'skip',
			reason: planned.reason,
			port: lease.port,
			listening: row.listening,
			recipe: lease.startCwd
				? lease.startCommand || 'pnpm serve'
				: planned.proposedCommand ?? null,
			proposedCwd: planned.proposedCwd,
			proposedCommand: planned.proposedCommand
		});
	}
	return { action, rows };
}
