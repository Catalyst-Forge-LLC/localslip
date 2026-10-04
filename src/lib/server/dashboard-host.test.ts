import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { dashboardListenLine, resolveDashboardHost } from './dashboard-host.js';

const previous = process.env.HOST;

afterEach(() => {
	if (previous === undefined) delete process.env.HOST;
	else process.env.HOST = previous;
});

describe('dashboard host', () => {
	it('listens on all interfaces unless --host or HOST is set', () => {
		delete process.env.HOST;
		assert.equal(resolveDashboardHost(), '0.0.0.0');
		assert.equal(resolveDashboardHost('127.0.0.1'), '127.0.0.1');
		process.env.HOST = '192.168.1.9';
		assert.equal(resolveDashboardHost(), '192.168.1.9');
		assert.equal(resolveDashboardHost('127.0.0.1'), '127.0.0.1');
	});

	it('prints the loopback URL when the socket is every interface', () => {
		assert.equal(
			dashboardListenLine('0.0.0.0', 54321),
			'LocalSlip dashboard  http://127.0.0.1:54321/  (all interfaces)'
		);
		assert.equal(dashboardListenLine('127.0.0.1', 54321), 'LocalSlip dashboard  http://127.0.0.1:54321/');
	});
});
