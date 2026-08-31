import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	applyProcessDetails,
	exeFromCommand,
	linuxStartFromStat,
	parseCimProcessJson,
	parseLsofFn,
	parsePsDetail,
	parsePsLstart
} from './process-detail.js';

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

describe('exeFromCommand', () => {
	it('takes an absolute or quoted image path', () => {
		assert.equal(exeFromCommand('/usr/local/bin/node vite.js'), '/usr/local/bin/node');
		assert.equal(
			exeFromCommand('"C:\\Program Files\\nodejs\\node.exe" serve'),
			'C:\\Program Files\\nodejs\\node.exe'
		);
		assert.equal(exeFromCommand('node vite.js'), null);
	});
});

describe('parsePsLstart', () => {
	it('reads a BSD ctime line', () => {
		const map = parsePsLstart('  31312 Fri Aug  7 09:01:02 2026\n');
		assert.equal(map.get(31312), new Date('Fri Aug  7 09:01:02 2026').toISOString());
	});
});

describe('parseLsofFn', () => {
	it('takes the first txt and the cwd', () => {
		const map = parseLsofFn(
			['p31312', 'ftxt', 'n/usr/local/bin/node', 'ftxt', 'n/usr/lib/dyld', 'fcwd', 'n/Users/me/app', ''].join(
				'\n'
			)
		);
		assert.deepEqual(map.get(31312), { exe: '/usr/local/bin/node', cwd: '/Users/me/app' });
	});

	it('skips missing cwd names', () => {
		const map = parseLsofFn(['p8', 'fcwd', 'n (cwd no longer exists)', 'ftxt', 'n/bin/zsh'].join('\n'));
		assert.deepEqual(map.get(8), { exe: '/bin/zsh', cwd: null });
	});
});

describe('linuxStartFromStat', () => {
	it('adds start ticks to btime', () => {
		const rest = Array(20).fill('0');
		rest[19] = '200';
		const line = `9 (node) ${rest.join(' ')}`;
		assert.equal(linuxStartFromStat(line, 1_700_000_000, 100), new Date(1_700_000_000 * 1000 + 2000).toISOString());
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

	it('fills exe from an absolute command when CIM/lsof omitted it', () => {
		const rows = [{ pid: 3, process: 'node' }];
		applyProcessDetails(
			rows,
			new Map([
				[
					3,
					{
						name: 'node',
						command: '/usr/local/bin/node vite.js',
						exe: null,
						cwd: null,
						parentPid: null,
						startedAt: null
					}
				]
			])
		);
		assert.equal(rows[0]?.exe, '/usr/local/bin/node');
	});
});
