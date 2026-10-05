import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { slipOpenPage } from './slip-open-page.js';
import { decideSlipOpen, editDistance, parseSlipPath, suggestSlipNames } from './slip-open.js';

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

describe('suggestSlipNames', () => {
	const names = ['engram', 'engram-site', 'forgetrail-site', 'localhelm', 'alpha', 'beta', 'gamma'];

	it('counts a substitution and an adjacent swap as one edit', () => {
		assert.equal(editDistance('engran', 'engram'), 1);
		assert.equal(editDistance('engrma', 'engram'), 1);
		assert.deepEqual(suggestSlipNames('engran', names), ['engram']);
		assert.deepEqual(suggestSlipNames('engrma', names), ['engram']);
	});

	it('allows two edits only when the typed name is at least 6 characters', () => {
		assert.deepEqual(suggestSlipNames('cat', ['cut']), ['cut']);
		assert.deepEqual(suggestSlipNames('ab', ['abcd']), []);
		assert.deepEqual(suggestSlipNames('engranx', names), ['engram']);
		assert.deepEqual(suggestSlipNames('forgetrail', ['forgetrail-site']), []);
		assert.deepEqual(suggestSlipNames('zzzzzz', names), []);
	});

	it('returns at most three, closest first, then by name', () => {
		assert.deepEqual(suggestSlipNames('aaaa', ['aaae', 'aaab', 'zzzz', 'aaad', 'aaac']), [
			'aaab',
			'aaac',
			'aaad'
		]);
		assert.deepEqual(suggestSlipNames('abcdef', ['abxxef', 'zzzzzz', 'abcde']), ['abcde', 'abxxef']);
	});

	it('keeps the rest of the path on the suggestion link', () => {
		const open = decideSlipOpen({
			name: 'engran',
			rest: '/imports',
			search: '?tab=1',
			hostHeader: 'localhost:54321',
			lease: null,
			listening: false,
			listenBind: null,
			names
		});
		assert.equal(open.kind, 'page');
		if (open.kind !== 'page') return;
		assert.deepEqual(open.suggestions, [{ name: 'engram', href: '/s/engram/imports?tab=1' }]);
		assert.match(slipOpenPage(open), /href="\/s\/engram\/imports\?tab=1"/);
		assert.match(slipOpenPage(open), /Did you mean/);
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

	it('opens an IPv6-only listener from an IPv4 loopback page', () => {
		const open = decideSlipOpen({
			name: 'engram',
			rest: '/',
			search: '',
			hostHeader: '127.0.0.1:54321',
			lease: { port: 6173 },
			listening: true,
			listenBind: '::1'
		});
		assert.deepEqual(open, { kind: 'redirect', location: 'http://[::1]:6173/' });
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
