import { rowOpenUrl } from './dashboard-url.js';
import { rowBindDisplay } from './row-detail.js';
import type { Board } from './server/board.js';
import type { BoardRow } from './types.js';

export type HelmPluginBoard = {
	plugin: 'localberth';
	tab: 'ports';
	title: string;
	note: string;
	rowLabel: string;
	columns: { id: string; label: string }[];
	rows: {
		id: string;
		label: string;
		href?: string;
		cells: Record<string, string>;
		actions: [];
	}[];
};

function processLabel(row: BoardRow): string {
	const name = row.observed?.process;
	if (!name) return '—';
	return row.observed?.pid != null ? `${name} (${row.observed.pid})` : name;
}

function hrefFor(row: BoardRow): string | undefined {
	return rowOpenUrl(row) ?? undefined;
}

/** Shape LocalHelm hosts on the Ports tab. LocalBerth still owns leases and observe. */
export function helmPluginBoards(board: Board): HelmPluginBoard[] {
	const hidden = board.hiddenSystem;
	return [
		{
			plugin: 'localberth',
			tab: 'ports',
			title: 'Leases',
			note: 'Named TCP leases. Claim, release, and firewall stay on the localberth CLI. Refresh to rescan listeners.',
			rowLabel: 'name',
			columns: [
				{ id: 'port', label: 'port' },
				{ id: 'bind', label: 'bind' },
				{ id: 'listening', label: 'listening' },
				{ id: 'process', label: 'process' },
				{ id: 'firewall', label: 'firewall' },
			],
			rows: board.leaseRows.map((row) => {
				const name = row.lease?.name ?? '—';
				return {
					id: name,
					label: name,
					href: hrefFor(row),
					cells: {
						port: row.lease ? String(row.lease.port) : '—',
						bind: rowBindDisplay(row),
						listening: row.listening ? 'yes' : 'no',
						process: processLabel(row),
						firewall: row.lease?.firewall ?? '—',
						conflict: row.conflict ? 'yes' : 'no',
					},
					actions: [],
				};
			}),
		},
		{
			plugin: 'localberth',
			tab: 'ports',
			title: 'Observed',
			note: hidden
				? `Listening sockets that are not a named lease. ${hidden} system port${hidden === 1 ? '' : 's'} hidden.`
				: 'Listening sockets that are not a named lease.',
			rowLabel: 'port',
			columns: [
				{ id: 'bind', label: 'bind' },
				{ id: 'process', label: 'process' },
			],
			rows: board.observedRows.map((row) => {
				const port = row.observed?.port;
				const bind = row.observed?.bind ?? '';
				const pid = row.observed?.pid ?? '';
				return {
					id: `obs:${port}:${bind}:${pid}`,
					label: port != null ? String(port) : '—',
					href: hrefFor(row),
					cells: {
						bind: rowBindDisplay(row),
						process: processLabel(row),
					},
					actions: [],
				};
			}),
		},
	];
}
