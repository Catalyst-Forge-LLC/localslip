import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { decideSlipOpen, parseSlipPath } from './slip-open.js';

describe('parseSlipPath', () => {
	it('reads a name and keeps the rest of the path', () => {
		assert.deepEqual(parseSlipPath('/s/engram'), { name: 'engram', rest: '/' });
		assert.deepEqual(parseSlipPath('/s/Engram/imports/'), { name: 'engram', rest: '/imports/' });
		assert.equal(parseSlipPath('/'), null);
		assert.equal(parseSlipPath('/s/'), null);
		assert.equal(parseSlipPath('/s/no_name'), null);
	});

	it('drops a protocol-relative rest', () => {
		assert.deepEqual(parseSlipPath('/s/engram//evil.com'), { name: 'engram', rest: '/' });
	});
});

describe('decideSlipOpen', () => {
	it('redirects a loopback host to the lease port and keeps path and query', () => {
		const open = decideSlipOpen({
			name: 'engram',
			rest: '/imports',
			search: '?tab=1',
			hostHeader: 'localhost:54321',
			lease: { port: 5193 },
			listening: true,
			listenBind: '127.0.0.1'
		});
		assert.deepEqual(open, { kind: 'redirect', location: 'http://localhost:5193/imports?tab=1' });
	});

	it('uses the host the browser typed', () => {
		const open = decideSlipOpen({
			name: 'engram',
			rest: '/',
			search: '',
			hostHeader: '100.74.12.14:54321',
			lease: { port: 5193 },
			listening: true,
			listenBind: '0.0.0.0'
		});
		assert.equal(open.kind, 'redirect');
		if (open.kind === 'redirect') assert.equal(open.location, 'http://100.74.12.14:5193/');
	});

	it('refuses a remote host when the process is loopback only', () => {
		const open = decideSlipOpen({
			name: 'engram',
			rest: '/',
			search: '',
			hostHeader: '100.74.12.14:4321',
			lease: { port: 5193 },
			listening: true,
			listenBind: '127.0.0.1'
		});
		assert.equal(open.kind, 'page');
		if (open.kind === 'page') assert.match(open.heading, /this computer only/);
	});

	it('says when the name is missing or the port is quiet', () => {
		const missing = decideSlipOpen({
			name: 'engram',
			rest: '/',
			search: '',
			hostHeader: 'localhost:54321',
			lease: null,
			listening: false,
			listenBind: null
		});
		assert.equal(missing.kind, 'page');
		if (missing.kind === 'page') assert.match(missing.heading, /No slip named engram/);
		const down = decideSlipOpen({
			name: 'engram',
			rest: '/',
			search: '',
			hostHeader: 'localhost:54321',
			lease: { port: 5193 },
			listening: false,
			listenBind: null
		});
		assert.equal(down.kind, 'page');
		if (down.kind === 'page') {
			assert.match(down.heading, /not up/);
			assert.match(down.detail, /:5193/);
		}
	});
});
