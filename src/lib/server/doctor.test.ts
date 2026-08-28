import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { doctorFromBoard, formatDoctorText } from './doctor.js';
import type { Board } from './board.js';
import type { BoardRow, Lease } from '../types.js';

function lease(partial: Partial<Lease> & { name: string; port: number }): Lease {
	return {
		bind: '127.0.0.1',
		protocol: 'tcp',
		kind: 'always',
		notes: '',
		firewall: 'skipped',
		updatedAt: '2026-08-25T00:00:00.000Z',
		startCwd: null,
		startCommand: null,
		spawnPid: null,
		...partial,
	};
}

function row(item: Lease, listening: boolean, extras: Partial<BoardRow> = {}): BoardRow {
	return {
		lease: item,
		observed: listening
			? {
					port: item.port,
					bind: item.bind,
					pid: 9,
					process: 'node',
					seenAt: item.updatedAt,
					leaseName: item.name,
				}
			: null,
		listening,
		conflict: false,
		also: [],
		...extras,
	};
}

describe('doctor', () => {
	it('fails when the recipe cwd is missing', () => {
		const demo = lease({ name: 'demo', port: 5179, startCwd: 'Z:/definitely-missing-localslip-cwd' });
		const board: Board = {
			leaseRows: [row(demo, false)],
			observedRows: [],
			hiddenSystem: 0,
			leases: [demo],
			observed: [],
		};
		const report = doctorFromBoard(board);
		assert.equal(report.ok, false);
		assert.equal(report.rows[0]?.check, 'cwd-missing');
		assert.match(formatDoctorText(report), /FAIL  demo  cwd-missing/);
	});

	it('fails on two listeners and warns when always is down', () => {
		const up = lease({ name: 'up', port: 5180 });
		const board: Board = {
			leaseRows: [
				row(up, true, {
					conflict: true,
					also: [
						{
							port: 5180,
							bind: '127.0.0.1',
							pid: 10,
							process: 'other',
							seenAt: up.updatedAt,
							leaseName: 'up',
						},
					],
				}),
				row(lease({ name: 'quiet', port: 5181 }), false),
			],
			observedRows: [],
			hiddenSystem: 0,
			leases: [up],
			observed: [],
		};
		const report = doctorFromBoard(board);
		assert.equal(report.ok, false);
		assert.ok(report.rows.some((item) => item.check === 'conflict' && item.level === 'fail'));
		assert.ok(report.rows.some((item) => item.check === 'always-down' && item.level === 'warn'));
	});

	it('warns when pnpm serve and a family -api share a cwd', () => {
		const cwd = process.cwd();
		const ui = lease({ name: 'dictawhisper', port: 7777, startCwd: cwd, startCommand: 'pnpm serve' });
		const api = lease({ name: 'dictawhisper-api', port: 8008, startCwd: cwd, startCommand: 'pnpm start' });
		const board: Board = {
			leaseRows: [row(ui, false), row(api, false)],
			observedRows: [],
			hiddenSystem: 0,
			leases: [ui, api],
			observed: [],
		};
		const report = doctorFromBoard(board);
		const leak = report.rows.find((item) => item.check === 'port-leak');
		assert.ok(leak);
		assert.equal(leak?.level, 'warn');
		assert.match(leak?.detail ?? '', /dictawhisper-api/);
		assert.match(leak?.detail ?? '', /PORT=7777/);
	});
});
