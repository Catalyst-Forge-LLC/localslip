import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { firewallLabel, firewallTip } from './firewall-label.js';

describe('firewallLabel', () => {
	it('uses board words and keeps a loopback claim distinct', () => {
		assert.equal(firewallLabel('skipped', '127.0.0.1'), 'private');
		assert.equal(firewallLabel('skipped', '::1'), 'private');
		assert.equal(firewallLabel('skipped', '0.0.0.0'), 'no rule');
		assert.equal(firewallLabel('needs-elevation', '0.0.0.0'), 'needs admin');
		assert.equal(firewallLabel('wanted', '0.0.0.0'), 'pending');
		assert.equal(firewallLabel('applied', '0.0.0.0'), 'allowed');
	});

	it('explains each word', () => {
		assert.match(firewallTip('skipped', '127.0.0.1'), /Loopback/);
		assert.match(firewallTip('skipped', '0.0.0.0'), /No inbound rule/);
		assert.match(firewallTip('needs-elevation', '0.0.0.0'), /Administrator/);
		assert.match(firewallTip('wanted', '0.0.0.0'), /not applied/);
		assert.match(firewallTip('applied', '0.0.0.0'), /installed/);
	});
});
