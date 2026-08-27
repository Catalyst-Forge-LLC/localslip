import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isQuietSite, quietSiteNames } from './quiet.js';
import type { Lease } from './types.js';

function lease(name: string, extra: Partial<Lease> = {}): Lease {
	return {
		name,
		port: 5181,
		bind: '127.0.0.1',
		protocol: 'tcp',
		kind: 'always',
		notes: '',
		firewall: 'skipped',
		updatedAt: '2026-08-25T00:00:00.000Z',
		...extra,
	};
}

describe('quiet sites', () => {
	it('stops listening *-site and skips the dashboard and parked rows', () => {
		assert.equal(isQuietSite(lease('aibreze-site'), true), true);
		assert.equal(isQuietSite(lease('aibreze-site'), false), false);
		assert.equal(isQuietSite(lease('aibreze'), true), false);
		assert.equal(isQuietSite(lease('localslip'), true), false);
		assert.equal(isQuietSite(lease('aibreze-site', { parked: true }), true), false);
		assert.deepEqual(
			quietSiteNames([
				{ lease: lease('aibreze-site'), listening: true },
				{ lease: lease('aibreze'), listening: true },
			]),
			['aibreze-site'],
		);
	});
});
