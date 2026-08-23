import { isLoopbackBind } from './binds.js';
import { rowBindDisplay } from './row-detail.js';
import type { BoardRow, FirewallStatus } from './types.js';

export type SortKey = 'name' | 'port' | 'bind' | 'listening' | 'process' | 'firewall';

export type SortState = { key: SortKey; dir: 1 | -1 };

export type BoardFilters = {
	listening?: boolean;
	firewall?: FirewallStatus;
	/** true = not loopback; false = loopback. */
	lan?: boolean;
	conflict?: true;
	ephemeral?: true;
};

export function rowIsLan(row: BoardRow): boolean {
	const bind =
		row.listening && row.observed?.bind
			? row.observed.bind
			: (row.lease?.bind ?? row.observed?.bind ?? '');
	return bind ? !isLoopbackBind(bind) : false;
}

export function rowMatchesFilters(row: BoardRow, filters: BoardFilters): boolean {
	if (filters.listening !== undefined && row.listening !== filters.listening) return false;
	if (filters.firewall && row.lease?.firewall !== filters.firewall) return false;
	if (filters.lan !== undefined && rowIsLan(row) !== filters.lan) return false;
	if (filters.conflict && !row.conflict) return false;
	if (filters.ephemeral && row.lease?.kind !== 'ephemeral') return false;
	return true;
}

export function filtersActive(filters: BoardFilters): boolean {
	return (
		filters.listening !== undefined ||
		Boolean(filters.firewall) ||
		filters.lan !== undefined ||
		Boolean(filters.conflict) ||
		Boolean(filters.ephemeral)
	);
}

function sortValue(row: BoardRow, key: SortKey): string | number {
	switch (key) {
		case 'name':
			return (row.lease?.name ?? '').toLowerCase();
		case 'port':
			return row.lease?.port ?? row.observed?.port ?? 0;
		case 'bind':
			return rowBindDisplay(row).toLowerCase();
		case 'listening':
			return row.listening ? 1 : 0;
		case 'process':
			return (row.observed?.process ?? '').toLowerCase();
		case 'firewall':
			return row.lease?.firewall ?? '';
	}
}

export function compareRows(a: BoardRow, b: BoardRow, sort: SortState): number {
	const va = sortValue(a, sort.key);
	const vb = sortValue(b, sort.key);
	let cmp = 0;
	if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
	else cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
	if (cmp === 0) {
		const na = (a.lease?.name ?? '').toLowerCase();
		const nb = (b.lease?.name ?? '').toLowerCase();
		cmp =
			na.localeCompare(nb) ||
			(a.lease?.port ?? a.observed?.port ?? 0) - (b.lease?.port ?? b.observed?.port ?? 0);
	}
	return cmp * sort.dir;
}

export function viewRows(rows: BoardRow[], filters: BoardFilters, sort: SortState): BoardRow[] {
	return rows.filter((row) => rowMatchesFilters(row, filters)).sort((a, b) => compareRows(a, b, sort));
}

export function nextSort(current: SortState, key: SortKey): SortState {
	if (current.key === key) return { key, dir: current.dir === 1 ? -1 : 1 };
	return { key, dir: 1 };
}
