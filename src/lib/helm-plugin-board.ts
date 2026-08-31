import { existsSync } from 'node:fs';
import { rowOpenUrl } from './dashboard-url.js';
import { recipeHealth } from './recipe-health.js';
import { rowBindDisplay } from './row-detail.js';
import { readLogTail } from './server/log-tail.js';
import type { Board } from './server/board.js';
import type { BoardRow } from './types.js';

export type HelmPluginBoard = {
	plugin: 'localslip';
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
		actions: { id: string; label: string; write: boolean; icon?: string }[];
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

/** Shape LocalHelm hosts on the Ports tab. LocalSlip still owns leases and observe. */
export function helmPluginBoards(board: Board): HelmPluginBoard[] {
	const hidden = board.hiddenSystem;
	return [
		{
			plugin: 'localslip',
			tab: 'ports',
			title: 'Leases',
			note: 'Named TCP leases. Start/Stop run the lease recipe (default pnpm serve) detached. Claim, release, and firewall stay on the localslip CLI.',
			rowLabel: 'name',
			columns: [
				{ id: 'port', label: 'port' },
				{ id: 'bind', label: 'bind' },
				{ id: 'listening', label: 'listening' },
				{ id: 'process', label: 'process' },
				{ id: 'recipe', label: 'recipe' },
				{ id: 'health', label: 'health' },
				{ id: 'log', label: 'log' },
				{ id: 'firewall', label: 'firewall' },
			],
			rows: board.leaseRows.map((row) => {
				const name = row.lease?.name ?? '—';
				const cwd = row.lease?.startCwd;
				const cwdOk = cwd ? (existsSync(cwd) ? 'yes' : 'no') : '—';
				const health = row.lease
					? recipeHealth(row.lease)
					: { status: 'no-recipe' as const, detail: 'No lease' };
				const log = row.logTail ?? (name !== '—' ? readLogTail(name) : null);
				const parked = Boolean(row.lease?.parked);
				const actions: { id: string; label: string; write: boolean; icon?: string }[] = [];
				if (parked) {
					actions.push({ id: 'unpark', label: 'Unpark', write: true, icon: 'lucide:circle-parking-off' });
				} else {
					if (row.listening) {
						actions.push({ id: 'stop', label: 'Stop', write: true, icon: 'lucide:square' });
					} else {
						actions.push({ id: 'start', label: 'Start', write: true, icon: 'lucide:play' });
						if (!cwd) {
							actions.push({ id: 'recipe', label: 'Save guess', write: true, icon: 'lucide:save' });
						}
					}
					actions.push({ id: 'park', label: 'Park', write: true, icon: 'lucide:circle-parking' });
				}
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
						recipe: cwd ? row.lease?.startCommand || 'pnpm serve' : '—',
						cwdOk,
						health: health.status,
						healthDetail: health.detail,
						kind: row.lease?.kind ?? '—',
						log: log?.preview ?? '—',
						logPreview: log?.preview ?? '—',
						parked: parked ? 'yes' : 'no',
					},
					actions,
				};
			}),
		},
		{
			plugin: 'localslip',
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
						command: row.observed?.command ?? '—',
						exe: row.observed?.exe ?? '—',
						cwd: row.observed?.cwd ?? '—',
						parentPid: row.observed?.parentPid != null ? String(row.observed.parentPid) : '—',
						parentProcess: row.observed?.parentProcess ?? '—',
						startedAt: row.observed?.startedAt ?? '—',
					},
					actions: [],
				};
			}),
		},
	];
}
