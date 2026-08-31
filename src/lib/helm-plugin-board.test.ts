import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { helmPluginBoards } from './helm-plugin-board.js';
import type { Board } from './server/board.js';
import type { BoardRow } from './types.js';

function leaseRow(partial: { name: string; port: number; listening?: boolean; conflict?: boolean }): BoardRow {
	const bind = '127.0.0.1';
	const listening = partial.listening ?? false;
	return {
		lease: {
			name: partial.name,
			port: partial.port,
			bind,
			protocol: 'tcp',
			kind: 'always',
			notes: '',
			firewall: 'skipped',
			updatedAt: '2026-08-23T12:00:00.000Z',
		},
		observed: listening
			? {
					port: partial.port,
					bind,
					pid: 9,
					process: 'node.exe',
					seenAt: '2026-08-23T12:00:00.000Z',
					leaseName: partial.name,
				}
			: null,
		listening,
		conflict: Boolean(partial.conflict),
		also: [],
	};
}

describe('helm plugin boards', () => {
	it('maps leases and observed onto the Ports tab with start/stop on leases', () => {
		const board: Board = {
			leaseRows: [leaseRow({ name: 'localhelm', port: 4321, listening: true })],
			observedRows: [
				{
					lease: null,
					observed: {
						port: 5173,
						bind: '127.0.0.1',
						pid: 2,
						process: 'vite',
						command: 'vite dev --host',
						seenAt: '2026-08-23T12:00:00.000Z',
						leaseName: null,
					},
					listening: true,
					conflict: false,
					also: [],
				},
			],
			hiddenSystem: 3,
			leases: [],
			observed: [],
		};
		const boards = helmPluginBoards(board);
		assert.equal(boards.length, 2);
		assert.equal(boards[0]?.tab, 'ports');
		assert.equal(boards[0]?.title, 'Leases');
		assert.equal(boards[0]?.rows[0]?.id, 'localhelm');
		assert.equal(boards[0]?.rows[0]?.cells.listening, 'yes');
		assert.equal(boards[0]?.rows[0]?.href, 'http://127.0.0.1:4321/');
		assert.deepEqual(
			boards[0]?.rows[0]?.actions.map((act) => act.id),
			['stop', 'park'],
		);
		assert.equal(boards[0]?.rows[0]?.cells.recipe, '—');
		assert.equal(boards[0]?.rows[0]?.cells.cwdOk, '—');
		assert.equal(boards[0]?.rows[0]?.cells.log, 'No log yet — start once.');
		assert.ok(boards[0]?.columns.some((col) => col.id === 'log'));
		assert.deepEqual(boards[1]?.rows[0]?.actions, []);
		assert.equal(boards[1]?.title, 'Observed');
		assert.match(boards[1]?.note ?? '', /3 system ports hidden/);
		assert.equal(boards[1]?.rows[0]?.label, '5173');
		assert.equal(boards[1]?.rows[0]?.cells.command, 'vite dev --host');
		assert.ok(!boards[1]?.columns.some((col) => col.id === 'command'));
	});
});
