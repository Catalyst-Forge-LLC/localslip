import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { planStart, planStop } from './lifecycle.js';
import type { Lease, Observed } from '../types.js';

const lease: Lease = {
	name: 'demo',
	port: 5179,
	bind: '127.0.0.1',
	protocol: 'tcp',
	kind: 'always',
	notes: '',
	firewall: 'skipped',
	updatedAt: '2026-08-24T00:00:00.000Z',
	startCwd: '/tmp/demo',
	startCommand: 'pnpm serve',
	spawnPid: null
};

describe('lifecycle plan', () => {
	it('refuses start without a recipe or a guess', () => {
		const planned = planStart({ ...lease, startCwd: null }, [], { propose: () => null });
		assert.equal(planned.writes, false);
		assert.match(planned.reason, /no matching folder/);
	});

	it('offers to save a guessed recipe', () => {
		const planned = planStart({ ...lease, startCwd: null }, [], {
			propose: () => ({ cwd: '/tmp/aibreze', command: 'pnpm site:dev' })
		});
		assert.equal(planned.writes, true);
		assert.equal(planned.proposedCwd, '/tmp/aibreze');
		assert.equal(planned.proposedCommand, 'pnpm site:dev');
		assert.match(planned.reason, /save recipe/);
	});

	it('refuses start when the port is already listening', () => {
		const listeners: Observed[] = [
			{
				port: 5179,
				bind: '127.0.0.1',
				pid: 9,
				process: 'node',
				seenAt: lease.updatedAt,
				leaseName: 'demo'
			}
		];
		const planned = planStart(lease, listeners);
		assert.equal(planned.writes, false);
		assert.match(planned.reason, /already listening/);
	});

	it('allows start when a recipe exists and nothing is listening', () => {
		assert.equal(planStart(lease, []).writes, true);
	});

	it('skips stop when nothing is running', () => {
		const planned = planStop({ ...lease, spawnPid: null }, []);
		assert.equal(planned.writes, false);
		assert.equal(planned.reason, 'not running');
	});
});
