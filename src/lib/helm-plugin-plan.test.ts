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
		const demo = plan.rows.find((r) => r.id === 'demo');
		assert.equal(demo?.port, 5179);
		assert.equal(demo?.host, '127.0.0.1');
	});

	it('expands family-start to unparked siblings', () => {
		const extra = {
			...board,
			leaseRows: [
				...board.leaseRows,
				row(lease({ name: 'demo-api', port: 5182, startCwd: '/tmp/demo' }), false),
			],
		};
		const plan = helmLifecyclePlan(extra, 'family-start', ['demo']);
		assert.deepEqual(
			plan.rows.map((r) => r.id).sort(),
			['demo', 'demo-api'],
		);
	});

	it('stops only a listening lease', () => {
		const plan = helmLifecyclePlan(board, 'stop', []);
		assert.equal(plan.rows.find((r) => r.id === 'up')?.writes, true);
		assert.equal(plan.rows.find((r) => r.id === 'demo')?.writes, false);
	});

	it('quiets only listening *-site leases', () => {
		const extra = {
			...board,
			leaseRows: [
				...board.leaseRows,
				row(lease({ name: 'demo-site', port: 5183, startCwd: '/tmp/demo' }), true),
				row(lease({ name: 'quiet-site', port: 5184, startCwd: '/tmp/quiet' }), false),
			],
			observed: [
				...board.observed,
				{
					port: 5183,
					bind: '127.0.0.1',
					pid: 7,
					process: 'node',
					seenAt: '2026-08-24T00:00:00.000Z',
					leaseName: 'demo-site',
				},
			],
		};
		const plan = helmLifecyclePlan(extra, 'quiet', []);
		assert.equal(plan.rows.find((r) => r.id === 'demo-site')?.writes, true);
		assert.equal(plan.rows.find((r) => r.id === 'quiet-site')?.writes, false);
		assert.equal(plan.rows.find((r) => r.id === 'up')?.writes, false);
	});
});
