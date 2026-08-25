import { existsSync } from 'node:fs';
import path from 'node:path';
import { familyStem, isServeCommand } from '../family.js';
import type { Board } from './board.js';
import { getBoard } from './board.js';
import { recipeFor } from './registry.js';

export type DoctorLevel = 'fail' | 'warn';

export type DoctorRow = {
	id: string;
	level: DoctorLevel;
	check: string;
	detail: string;
};

export type DoctorReport = {
	ok: boolean;
	fail: number;
	warn: number;
	rows: DoctorRow[];
};

function cwdKey(cwd: string): string {
	return path.resolve(cwd).replace(/\\/g, '/').toLowerCase();
}

/** Parked+listening is skipped until park lands (B3). */
export function doctorFromBoard(board: Board): DoctorReport {
	const rows: DoctorRow[] = [];

	for (const row of board.leaseRows) {
		const lease = row.lease;
		if (!lease) continue;
		const recipe = recipeFor(lease);
		if (recipe && !existsSync(recipe.cwd)) {
			rows.push({
				id: lease.name,
				level: 'fail',
				check: 'cwd-missing',
				detail: `start cwd missing: ${recipe.cwd}`,
			});
		}
		if (row.conflict) {
			const extras = row.also.length
				? ` (${row.also.length} other listener${row.also.length === 1 ? '' : 's'})`
				: '';
			rows.push({
				id: lease.name,
				level: 'fail',
				check: 'conflict',
				detail: `more than one listener on ${lease.port}${extras}`,
			});
		}
		if (lease.kind === 'always' && !row.listening) {
			rows.push({
				id: lease.name,
				level: 'warn',
				check: 'always-down',
				detail: `kind always and not listening on ${lease.port}`,
			});
		}
	}

	const allLeases =
		board.leases.length > 0
			? board.leases
			: board.leaseRows.map((row) => row.lease).filter((lease): lease is NonNullable<typeof lease> => Boolean(lease));
	const byCwd = new Map<string, NonNullable<(typeof board.leaseRows)[number]['lease']>[]>();
	for (const lease of allLeases) {
		if (!lease.startCwd) continue;
		const key = cwdKey(lease.startCwd);
		const list = byCwd.get(key) ?? [];
		list.push(lease);
		byCwd.set(key, list);
	}

	for (const [cwd, leases] of byCwd) {
		if (leases.length < 2) continue;
		const serve = leases.filter((lease) => isServeCommand(lease.startCommand));
		const apis = leases.filter((lease) => lease.name.toLowerCase().endsWith('-api'));
		if (serve.length && apis.length) {
			for (const item of serve) {
				const sibs = apis.filter((api) => api.name !== item.name);
				if (!sibs.length) continue;
				if (sibs.every((api) => familyStem(api.name) !== familyStem(item.name))) continue;
				rows.push({
					id: item.name,
					level: 'warn',
					check: 'port-leak',
					detail: `pnpm serve shares ${cwd} with ${sibs.map((s) => s.name).join(', ')}; those children must not inherit PORT=${item.port}`,
				});
			}
			continue;
		}
		rows.push({
			id: leases[0]!.name,
			level: 'warn',
			check: 'shared-cwd',
			detail: `${leases.map((lease) => lease.name).join(', ')} share ${cwd}; start sets PORT to each lease`,
		});
	}

	const fail = rows.filter((row) => row.level === 'fail').length;
	return { ok: fail === 0, fail, warn: rows.length - fail, rows };
}

export async function runDoctor(): Promise<DoctorReport> {
	return doctorFromBoard(await getBoard());
}

export function formatDoctorText(report: DoctorReport): string {
	if (!report.rows.length) return 'ok\n';
	const lines = report.rows.map((row) => {
		const level = row.level === 'fail' ? 'FAIL' : 'WARN';
		return `${level}  ${row.id}  ${row.check}  ${row.detail}`;
	});
	lines.push('');
	lines.push(`${report.fail} fail, ${report.warn} warn`);
	return `${lines.join('\n')}\n`;
}
