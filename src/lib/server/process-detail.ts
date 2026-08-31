import { execFile } from 'node:child_process';
import { readlinkSync, readFileSync, statSync } from 'node:fs';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type ProcessDetail = {
	name: string | null;
	command: string | null;
	exe: string | null;
	cwd: string | null;
	parentPid: number | null;
	startedAt: string | null;
};

function run(cmd: string, args: string[]): Promise<string> {
	return execFileAsync(cmd, args, { windowsHide: true, maxBuffer: 8 * 1024 * 1024 })
		.then((r) => r.stdout)
		.catch((err: NodeJS.ErrnoException & { stdout?: string }) => {
			if (err.stdout !== undefined) return err.stdout;
			return '';
		});
}

function trim(value: unknown): string | null {
	if (value == null) return null;
	const text = String(value).replace(/\s+/g, ' ').trim();
	return text || null;
}

function cimDateToIso(value: unknown): string | null {
	if (value == null) return null;
	if (typeof value === 'number' && Number.isFinite(value)) {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d.toISOString();
	}
	if (typeof value === 'string') {
		const msJson = value.match(/\/Date\((-?\d+)\)\//);
		if (msJson) {
			const d = new Date(Number(msJson[1]));
			return Number.isNaN(d.getTime()) ? null : d.toISOString();
		}
		const dmtf = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
		if (dmtf) {
			const d = new Date(
				`${dmtf[1]}-${dmtf[2]}-${dmtf[3]}T${dmtf[4]}:${dmtf[5]}:${dmtf[6]}Z`
			);
			return Number.isNaN(d.getTime()) ? null : d.toISOString();
		}
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? null : d.toISOString();
	}
	if (typeof value === 'object' && value && 'DateTime' in value) {
		return cimDateToIso((value as { DateTime?: string }).DateTime);
	}
	return null;
}

export function parseCimProcessJson(stdout: string): Map<number, ProcessDetail> {
	const map = new Map<number, ProcessDetail>();
	const raw = stdout.trim();
	if (!raw) return map;
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return map;
	}
	const rows = Array.isArray(parsed) ? parsed : [parsed];
	for (const row of rows) {
		if (!row || typeof row !== 'object') continue;
		const rec = row as Record<string, unknown>;
		const pid = Number(rec.ProcessId);
		if (!Number.isInteger(pid) || pid <= 0) continue;
		map.set(pid, {
			name: trim(rec.Name),
			command: trim(rec.CommandLine),
			exe: trim(rec.ExecutablePath),
			cwd: null,
			parentPid: Number.isInteger(Number(rec.ParentProcessId)) ? Number(rec.ParentProcessId) : null,
			startedAt: cimDateToIso(rec.CreationDate)
		});
	}
	return map;
}

export function parsePsDetail(stdout: string): Map<number, ProcessDetail> {
	const map = new Map<number, ProcessDetail>();
	for (const line of stdout.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		const parts = trimmed.split(/\s+/);
		if (parts.length < 3) continue;
		const pid = Number(parts[0]);
		const parentPid = Number(parts[1]);
		if (!Number.isInteger(pid) || pid <= 0) continue;
		const command = trim(parts.slice(2).join(' '));
		const image = command?.split(/[/\\]/).pop()?.split(/\s/)[0] ?? null;
		map.set(pid, {
			name: trim(image),
			command,
			exe: null,
			cwd: null,
			parentPid: Number.isInteger(parentPid) && parentPid > 0 ? parentPid : null,
			startedAt: null
		});
	}
	return map;
}

function linuxProcDetail(pid: number): ProcessDetail {
	const detail: ProcessDetail = {
		name: null,
		command: null,
		exe: null,
		cwd: null,
		parentPid: null,
		startedAt: null
	};
	try {
		detail.name = trim(readFileSync(`/proc/${pid}/comm`, 'utf8'));
	} catch {
		/* gone */
	}
	try {
		detail.startedAt = statSync(`/proc/${pid}`).ctime.toISOString();
	} catch {
		/* gone */
	}
	try {
		const cmd = readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0+$/, '').replace(/\0/g, ' ');
		detail.command = trim(cmd);
	} catch {
		/* gone */
	}
	try {
		detail.cwd = trim(readlinkSync(`/proc/${pid}/cwd`));
	} catch {
		/* gone or no access */
	}
	try {
		detail.exe = trim(readlinkSync(`/proc/${pid}/exe`));
	} catch {
		/* gone or no access */
	}
	try {
		const status = readFileSync(`/proc/${pid}/status`, 'utf8');
		const ppid = status.match(/^PPid:\s+(\d+)/m);
		if (ppid) detail.parentPid = Number(ppid[1]);
	} catch {
		/* gone */
	}
	return detail;
}

async function queryCim(pids: number[]): Promise<Map<number, ProcessDetail>> {
	const map = new Map<number, ProcessDetail>();
	const chunkSize = 40;
	for (let i = 0; i < pids.length; i += chunkSize) {
		const chunk = pids.slice(i, i + chunkSize);
		const filter = chunk.map((pid) => `ProcessId=${pid}`).join(' OR ');
		const stdout = await run('powershell.exe', [
			'-NoProfile',
			'-Command',
			`Get-CimInstance Win32_Process -Filter "${filter}" | Select-Object ProcessId,Name,ExecutablePath,CommandLine,ParentProcessId,CreationDate | ConvertTo-Json -Compress`
		]);
		for (const [pid, row] of parseCimProcessJson(stdout)) map.set(pid, row);
	}
	return map;
}

async function windowsDetails(pids: number[]): Promise<Map<number, ProcessDetail>> {
	if (pids.length === 0) return new Map();
	const map = await queryCim(pids);
	const parents = [
		...new Set(
			[...map.values()]
				.map((row) => row.parentPid)
				.filter((pid): pid is number => pid != null && pid > 0 && !map.has(pid))
		)
	];
	if (parents.length) {
		for (const [pid, row] of await queryCim(parents)) map.set(pid, row);
	}
	return map;
}

async function unixDetails(pids: number[]): Promise<Map<number, ProcessDetail>> {
	const map = new Map<number, ProcessDetail>();
	if (pids.length === 0) return map;
	if (process.platform === 'linux') {
		for (const pid of pids) map.set(pid, linuxProcDetail(pid));
		for (const row of [...map.values()]) {
			if (row.parentPid && row.parentPid > 0 && !map.has(row.parentPid)) {
				map.set(row.parentPid, linuxProcDetail(row.parentPid));
			}
		}
		return map;
	}
	const withParents = new Set(pids);
	const stdout = await run('ps', ['-p', [...withParents].join(','), '-o', 'pid=', '-o', 'ppid=', '-o', 'command=']);
	const fromPs = parsePsDetail(stdout);
	for (const [pid, row] of fromPs) map.set(pid, row);
	const parents = [
		...new Set(
			[...map.values()]
				.map((row) => row.parentPid)
				.filter((pid): pid is number => pid != null && pid > 0 && !map.has(pid))
		)
	];
	if (parents.length) {
		const extra = await run('ps', ['-p', parents.join(','), '-o', 'pid=', '-o', 'ppid=', '-o', 'command=']);
		for (const [pid, row] of parsePsDetail(extra)) map.set(pid, row);
	}
	if (process.platform === 'darwin') {
		for (const pid of pids) {
			const lsof = await run('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn']);
			const line = lsof.split(/\r?\n/).find((l) => l.startsWith('n'));
			const cwd = line ? trim(line.slice(1)) : null;
			const prev = map.get(pid) ?? {
				name: null,
				command: null,
				exe: null,
				cwd: null,
				parentPid: null,
				startedAt: null
			};
			map.set(pid, { ...prev, cwd });
		}
	}
	return map;
}

export async function processDetails(pids: Iterable<number>): Promise<Map<number, ProcessDetail>> {
	const list = [...new Set([...pids].filter((pid) => Number.isInteger(pid) && pid > 0))];
	if (list.length === 0) return new Map();
	return process.platform === 'win32' ? windowsDetails(list) : unixDetails(list);
}

export function applyProcessDetails<T extends { pid: number | null }>(
	rows: T[],
	details: Map<number, ProcessDetail>
): T[] {
	for (const row of rows) {
		if (!row.pid) continue;
		const extra = details.get(row.pid);
		if (!extra) continue;
		Object.assign(row, {
			command: extra.command,
			exe: extra.exe,
			cwd: extra.cwd,
			parentPid: extra.parentPid,
			startedAt: extra.startedAt,
			parentProcess:
				extra.parentPid != null ? (details.get(extra.parentPid)?.name ?? null) : null
		});
	}
	return rows;
}
