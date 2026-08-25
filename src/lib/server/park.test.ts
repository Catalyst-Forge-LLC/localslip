import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

const home = mkdtempSync(join(tmpdir(), 'localberth-park-'));
process.env.LOCALBERTH_HOME = home;

const { resetDb } = await import('./db.js');
const { claim, getLease } = await import('./registry.js');
const { planPark, planUnpark, parkLease, unparkLease } = await import('./park.js');

describe('park', () => {
	before(() => {
		resetDb();
	});

	after(() => {
		resetDb();
		rmSync(home, { recursive: true, force: true });
	});

	it('keeps the port and hides the lease', async () => {
		const { lease } = claim({ name: 'demo-park', port: 5178 });
		const planned = planPark(lease, []);
		assert.equal(planned.writes, true);
		assert.match(planned.reason, /port stays/);
		const result = await parkLease('demo-park');
		assert.equal(result.action, 'park');
		const after = getLease('demo-park');
		assert.equal(after?.parked, true);
		assert.equal(after?.port, 5178);
		assert.equal(planUnpark(after!).writes, true);
		const undone = await unparkLease('demo-park');
		assert.equal(undone.action, 'unpark');
		assert.equal(getLease('demo-park')?.parked, false);
	});
});
