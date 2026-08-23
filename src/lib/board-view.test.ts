import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { nextSort, viewRows, type BoardFilters } from './board-view.js';
import type { BoardRow, FirewallStatus, LeaseKind } from './types.js';

function row(partial: {
	name?: string;
	port: number;
	bind?: string;
	listening?: boolean;
	process?: string | null;
	firewall?: FirewallStatus;
	kind?: LeaseKind;
	conflict?: boolean;
	lease?: boolean;
}): BoardRow {
	const hasLease = partial.lease !== false;
	const name = partial.name ?? 'foo';
	const bind = partial.bind ?? '127.0.0.1';
	const listening = partial.listening ?? false;
	return {
		lease: hasLease
			? {
					name,
					port: partial.port,
					bind,
					protocol: 'tcp',
					kind: partial.kind ?? 'always',
					notes: '',
					firewall: partial.firewall ?? 'skipped',
					updatedAt: '2026-08-20T12:00:00.000Z'
				}
			: null,
		observed: listening
			? {
					port: partial.port,
					bind,
					pid: 1,
					process: partial.process ?? 'node.exe',
					seenAt: '2026-08-20T12:00:00.000Z',
					leaseName: hasLease ? name : null
				}
			: null,
		listening,
		conflict: Boolean(partial.conflict),
		also: []
	};
}

describe('viewRows', () => {
	const rows = [
		row({ name: 'bar', port: 5174, listening: false, firewall: 'wanted' }),
		row({ name: 'foo', port: 5173, listening: true, bind: '0.0.0.0', firewall: 'applied' }),
		row({
			name: 'fizzbuzz',
			port: 5193,
			listening: true,
			firewall: 'needs-elevation',
			kind: 'ephemeral',
			conflict: true
		})
	];

	it('sorts by name ascending by default order', () => {
		const view = viewRows(rows, {}, { key: 'name', dir: 1 });
		assert.deepEqual(
			view.map((r) => r.lease?.name),
			['bar', 'fizzbuzz', 'foo']
		);
	});

	it('sorts by port and flips on nextSort', () => {
		const asc = viewRows(rows, {}, { key: 'port', dir: 1 });
		assert.deepEqual(
			asc.map((r) => r.lease?.port),
			[5173, 5174, 5193]
		);
		const desc = viewRows(rows, {}, nextSort({ key: 'port', dir: 1 }, 'port'));
		assert.deepEqual(
			desc.map((r) => r.lease?.port),
			[5193, 5174, 5173]
		);
	});

	it('filters listening and LAN together', () => {
		const filters: BoardFilters = { listening: true, lan: true };
		const view = viewRows(rows, filters, { key: 'name', dir: 1 });
		assert.deepEqual(
			view.map((r) => r.lease?.name),
			['foo']
		);
	});

	it('filters firewall and conflict', () => {
		const view = viewRows(rows, { firewall: 'needs-elevation', conflict: true }, { key: 'name', dir: 1 });
		assert.equal(view.length, 1);
		assert.equal(view[0]?.lease?.name, 'fizzbuzz');
	});

	it('filters ephemeral', () => {
		const view = viewRows(rows, { ephemeral: true }, { key: 'port', dir: 1 });
		assert.equal(view.length, 1);
		assert.equal(view[0]?.lease?.kind, 'ephemeral');
	});
});
