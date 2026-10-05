import { bindRelation, displayBind } from './binds.js';
import { firewallLabel } from './firewall-label.js';
import type { BoardRow } from './types.js';

export type DetailField = { label: string; value: string; wide?: boolean; warn?: boolean; wrap?: boolean };

/** Short word for a bind that does not match the claim, or a second listener on the port. */
export function rowMismatchWord(row: BoardRow): string | null {
	if (row.lease && row.observed?.bind) {
		const relation = bindRelation(row.lease.bind, row.observed.bind);
		if (relation === 'wider' || relation === 'narrower' || relation === 'other') return relation;
	}
	if (row.also.length > 0) return 'also';
	return null;
}

/** Bind the table should show: the listen address when up, else the claim. */
export function rowBindDisplay(row: BoardRow): string {
	if (row.listening && row.observed?.bind) return displayBind(row.observed.bind);
	const raw = row.lease?.bind ?? row.observed?.bind;
	return raw ? displayBind(raw) : '—';
}

export function rowDetailFields(row: BoardRow): DetailField[] {
	const fields: DetailField[] = [];
	if (row.lease) {
		const health = row.recipe ?? {
			detail: 'No start recipe. Save a guess or set cwd.',
			warn: true
		};
		fields.push({ label: 'Kind', value: row.lease.kind });
		fields.push({
			label: 'Recipe health',
			value: health.detail,
			wide: true,
			warn: health.warn
		});
		if (row.lease.notes) fields.push({ label: 'Notes', value: row.lease.notes, wide: true });
		fields.push({ label: 'Claimed', value: row.lease.updatedAt.slice(0, 19).replace('T', ' ') });
		fields.push({ label: 'Claim', value: displayBind(row.lease.bind) });
	}
	if (row.observed?.bind) {
		fields.push({ label: 'Listen', value: displayBind(row.observed.bind) });
	}
	if (row.lease && row.observed?.bind) {
		const relation = bindRelation(row.lease.bind, row.observed.bind);
		if (relation === 'wider') {
			fields.push({
				label: 'Mismatch',
				value: 'Process is on all interfaces; lease is loopback.',
				wide: true,
				warn: true
			});
		} else if (relation === 'narrower') {
			fields.push({
				label: 'Mismatch',
				value: 'Lease is LAN; process is loopback only.',
				wide: true,
				warn: true
			});
		} else if (relation === 'other') {
			fields.push({
				label: 'Mismatch',
				value: `Listening on ${row.observed.bind}, not ${row.lease.bind}.`,
				wide: true,
				warn: true
			});
		}
	}
	if (row.also.length > 0) {
		fields.push({
			label: 'Also',
			value: row.also
				.map((h) => `${h.bind}${h.pid != null ? ` pid ${h.pid}` : ''}`)
				.join(', '),
			wide: true,
			warn: true
		});
	}
	if (row.lease) {
		fields.push({ label: 'Firewall', value: firewallLabel(row.lease.firewall, row.lease.bind) });
	}
	if (row.observed?.process) fields.push({ label: 'Process', value: row.observed.process });
	if (row.observed?.pid != null) fields.push({ label: 'PID', value: String(row.observed.pid) });
	if (row.observed?.parentPid != null) {
		const parent = row.observed.parentProcess
			? `${row.observed.parentProcess} (${row.observed.parentPid})`
			: String(row.observed.parentPid);
		fields.push({ label: 'Parent', value: parent });
	}
	if (row.observed?.startedAt) {
		fields.push({
			label: 'Started',
			value: row.observed.startedAt.slice(0, 19).replace('T', ' ')
		});
	}
	if (row.observed?.exe) {
		fields.push({ label: 'Executable', value: row.observed.exe, wide: true, wrap: true });
	}
	if (row.observed?.cwd) {
		fields.push({ label: 'Cwd', value: row.observed.cwd, wide: true, wrap: true });
	}
	if (row.observed?.command) {
		fields.push({ label: 'Command', value: row.observed.command, wide: true, wrap: true });
	}
	return fields;
}
