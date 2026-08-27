import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

const home = mkdtempSync(join(tmpdir(), 'localberth-port-'));
process.env.LOCALSLIP_HOME = home;

const { resetDb } = await import('./server/db.js');
const { claim } = await import('./server/registry.js');
const { localslipListen, localslipPort } = await import('./port.js');

describe('localslipListen', () => {
	before(() => {
		resetDb();
	});

	after(() => {
		resetDb();
		rmSync(home, { recursive: true, force: true });
	});

	it('returns host and port from the lease', () => {
		claim({ name: 'foo', port: 6173 });
		assert.deepEqual(localslipListen('foo', 5173), { host: '127.0.0.1', port: 6173 });
		assert.equal(localslipPort('foo', 5173), 6173);
	});

	it('falls back to loopback when the name is missing', () => {
		assert.deepEqual(localslipListen('missing', 5173), { host: '127.0.0.1', port: 5173 });
	});
});
