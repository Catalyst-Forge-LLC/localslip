import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { helmLifecyclePlan } from './helm-plugin-plan.js';
import type { Board } from './server/board.js';
import type { BoardRow, Lease } from './types.js';

function lease(partial: Partial<Lease> & { name: string; port: number }): Lease {
	return {
		bind: '127.0.0.1',
		protocol: 'tcp',
		kind: 'always',
		notes: '',
		firewall: 'skipped',
		updatedAt: '2026-08-24T00:00:00.000Z',
		startCwd: null,
		startCommand: null,
		spawnPid: null,
		...partial
	};
}

function row(item: Lease, listening: boolean): BoardRow {
	return {
		lease: item,
		observed: listening
			? {
					port: item.port,
					bind: item.bind,
					pid: 42,
					process: 'node',
					seenAt: item.updatedAt,
					leaseName: item.name
				}
			: null,
		listening,
		conflict: false,
		also: []
	};
}

describe('helm lifecycle plan', () => {
	const board: Board = {
		leaseRows: [
			row(lease({ name: 'demo', port: 5179, startCwd: '/tmp/demo' }), false),
			row(lease({ name: 'up', port: 5180, startCwd: '/tmp/up' }), true),
			row(lease({ name: 'bare', port: 5181 }), false)
		],
		observedRows: [],
		hiddenSystem: 0,
		leases: [],
		observed: [
			{
				port: 5180,
				bind: '127.0.0.1',
				pid: 42,
				process: 'node',
				seenAt: '2026-08-24T00:00:00.000Z',
				leaseName: 'up'
			}
		]
	};

	it('starts only a named lease with a recipe that is not listening', () => {
		const plan = helmLifecyclePlan(board, 'start', ['demo', 'up', 'bare']);
		assert.deepEqual(
			plan.rows.map((r) => [r.id, r.writes, r.action]),
			[
				['demo', true, 'start'],
				['up', false, 'skip'],
				['bare', false, 'skip']
			]
		);
	});

	it('stops only a listening lease', () => {
		const plan = helmLifecyclePlan(board, 'stop', []);
		assert.equal(plan.rows.find((r) => r.id === 'up')?.writes, true);
		assert.equal(plan.rows.find((r) => r.id === 'demo')?.writes, false);
	});
});
