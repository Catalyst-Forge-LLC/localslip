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

function emptyDetail(): ProcessDetail {
	return {
		name: null,
		command: null,
		exe: null,
		cwd: null,
		parentPid: null,
		startedAt: null
	};
}

/** First token when it looks like an absolute image path. */
export function exeFromCommand(command: string | null): string | null {
	if (!command) return null;
	const text = command.trim();
	let token: string;
	if (text.startsWith('"')) {
		const end = text.indexOf('"', 1);
		if (end < 1) return null;
		token = text.slice(1, end);
	} else {
		token = text.split(/\s+/)[0] ?? '';
	}
	token = token.trim();
	if (!token) return null;
	if (token.startsWith('/')) return token;
	if (/^[A-Za-z]:[\\/]/.test(token)) return token;
	return null;
}

/** `ps -o pid=,lstart=` — BSD/macOS ctime line after the pid. */
export function parsePsLstart(stdout: string): Map<number, string> {
	const map = new Map<number, string>();
	for (const line of stdout.split(/\r?\n/)) {
		const trimmed = line.trim();
		const match = trimmed.match(/^(\d+)\s+(.+)$/);
		if (!match) continue;
		const pid = Number(match[1]);
		if (!Number.isInteger(pid) || pid <= 0) continue;
		const started = new Date(match[2].trim());
		if (Number.isNaN(started.getTime())) continue;
		map.set(pid, started.toISOString());
	}
	return map;
}

/** `lsof -F pfn` for `-d cwd,txt`. First txt name is the image. */
export function parseLsofFn(stdout: string): Map<number, { exe: string | null; cwd: string | null }> {
	const map = new Map<number, { exe: string | null; cwd: string | null }>();
	let pid = 0;
	let field: 'txt' | 'cwd' | null = null;
	for (const line of stdout.split(/\r?\n/)) {
		if (!line) continue;
		const kind = line[0];
		const value = line.slice(1);
		if (kind === 'p') {
			pid = Number(value);
			field = null;
			if (Number.isInteger(pid) && pid > 0 && !map.has(pid)) {
				map.set(pid, { exe: null, cwd: null });
			}
			continue;
		}
		if (!pid) continue;
		if (kind === 'f') {
			const fd = value.toLowerCase();
			field = fd === 'txt' || fd === 'cwd' ? fd : null;
			continue;
		}
		if (kind !== 'n' || !field) continue;
		const path = trim(value);
		if (!path || path.startsWith('(')) {
			field = null;
			continue;
		}
		const row = map.get(pid) ?? { exe: null, cwd: null };
		if (field === 'txt' && !row.exe) row.exe = path;
		if (field === 'cwd') row.cwd = path;
		map.set(pid, row);
		field = null;
	}
	return map;
}

/** `/proc/<pid>/stat` field 22 + `btime`. `hz` is USER_HZ (almost always 100). */
export function linuxStartFromStat(statLine: string, btimeSec: number, hz = 100): string | null {
	if (!Number.isFinite(btimeSec) || !Number.isFinite(hz) || hz <= 0) return null;
	const close = statLine.lastIndexOf(')');
	if (close < 0) return null;
	const rest = statLine.slice(close + 2).trim().split(/\s+/);
	const ticks = Number(rest[19]);
	if (!Number.isFinite(ticks) || ticks < 0) return null;
	return new Date((btimeSec + ticks / hz) * 1000).toISOString();
}

function linuxBtime(): number | null {
	try {
		const match = readFileSync('/proc/stat', 'utf8').match(/^btime (\d+)/m);
		return match ? Number(match[1]) : null;
	} catch {
		return null;
	}
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

function linuxProcDetail(pid: number, btime: number | null): ProcessDetail {
	const detail = emptyDetail();
	try {
		detail.name = trim(readFileSync(`/proc/${pid}/comm`, 'utf8'));
	} catch {
		/* gone */
	}
	if (btime != null) {
		try {
			detail.startedAt = linuxStartFromStat(readFileSync(`/proc/${pid}/stat`, 'utf8'), btime);
		} catch {
			/* gone */
		}
	}
	if (!detail.startedAt) {
		try {
			detail.startedAt = statSync(`/proc/${pid}`).ctime.toISOString();
		} catch {
			/* gone */
		}
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
	if (!detail.exe) detail.exe = exeFromCommand(detail.command);
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
		const btime = linuxBtime();
		for (const pid of pids) map.set(pid, linuxProcDetail(pid, btime));
		for (const row of [...map.values()]) {
			if (row.parentPid && row.parentPid > 0 && !map.has(row.parentPid)) {
				map.set(row.parentPid, linuxProcDetail(row.parentPid, btime));
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
		const list = pids.join(',');
		const [lsofOut, startOut] = await Promise.all([
			run('lsof', ['-a', '-p', list, '-d', 'cwd,txt', '-F', 'pfn']),
			run('ps', ['-p', list, '-o', 'pid=', '-o', 'lstart='])
		]);
		const files = parseLsofFn(lsofOut);
		const starts = parsePsLstart(startOut);
		for (const pid of pids) {
			const prev = map.get(pid) ?? emptyDetail();
			const file = files.get(pid);
			map.set(pid, {
				...prev,
				exe: file?.exe ?? exeFromCommand(prev.command),
				cwd: file?.cwd ?? prev.cwd,
				startedAt: starts.get(pid) ?? prev.startedAt
			});
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
			exe: extra.exe ?? exeFromCommand(extra.command),
			cwd: extra.cwd,
			parentPid: extra.parentPid,
			startedAt: extra.startedAt,
			parentProcess:
				extra.parentPid != null ? (details.get(extra.parentPid)?.name ?? null) : null
		});
	}
	return rows;
}
