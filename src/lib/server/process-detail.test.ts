import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyProcessDetails, parseCimProcessJson, parsePsDetail } from './process-detail.js';

describe('parseCimProcessJson', () => {
	it('reads a CIM array', () => {
		const map = parseCimProcessJson(
			JSON.stringify([
				{
					ProcessId: 26772,
					Name: 'node.exe',
					ExecutablePath: 'C:\\\\Program Files\\\\nodejs\\\\node.exe',
					CommandLine: 'node dist/index.js --port 9009',
					ParentProcessId: 27668,
					CreationDate: '2026-08-31T20:00:00.000Z'
				}
			])
		);
		const row = map.get(26772);
		assert.equal(row?.name, 'node.exe');
		assert.equal(row?.command, 'node dist/index.js --port 9009');
		assert.equal(row?.parentPid, 27668);
		assert.equal(row?.startedAt, '2026-08-31T20:00:00.000Z');
		assert.equal(row?.cwd, null);
	});

	it('reads a Microsoft JSON date', () => {
		const ms = Date.UTC(2026, 7, 31, 18, 0, 0);
		const map = parseCimProcessJson(
			JSON.stringify({
				ProcessId: 8,
				Name: 'node.exe',
				CreationDate: `/Date(${ms})/`
			})
		);
		assert.equal(map.get(8)?.startedAt, new Date(ms).toISOString());
	});

	it('reads a single CIM object', () => {
		const map = parseCimProcessJson(
			JSON.stringify({
				ProcessId: 1,
				CommandLine: 'vite',
				ExecutablePath: '/vite',
				ParentProcessId: 2
			})
		);
		assert.equal(map.get(1)?.command, 'vite');
	});
});

describe('parsePsDetail', () => {
	it('reads pid ppid command', () => {
		const map = parsePsDetail('  31312  31044 node vite.js dev --host\n');
		assert.deepEqual(map.get(31312), {
			name: 'node',
			command: 'node vite.js dev --host',
			exe: null,
			cwd: null,
			parentPid: 31044,
			startedAt: null
		});
	});
});

describe('applyProcessDetails', () => {
	it('copies detail onto matching pids', () => {
		const rows = [
			{ pid: 9, process: 'node.exe' },
			{ pid: 8, process: 'other' }
		];
		applyProcessDetails(
			rows,
			new Map([
				[
					9,
					{
						name: 'node.exe',
						command: 'pnpm dev',
						exe: 'C:/node.exe',
						cwd: null,
						parentPid: 1,
						startedAt: '2026-08-31T12:00:00.000Z'
					}
				],
				[
					1,
					{
						name: 'npm.cmd',
						command: null,
						exe: null,
						cwd: null,
						parentPid: 0,
						startedAt: null
					}
				]
			])
		);
		assert.equal(rows[0]?.command, 'pnpm dev');
		assert.equal((rows[0] as { parentProcess?: string }).parentProcess, 'npm.cmd');
		assert.equal(rows[1]?.command, undefined);
	});
});
