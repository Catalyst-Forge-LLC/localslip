import { isLoopbackBind } from './binds.js';
import { visitorHttpUrl, visitorPageHost } from './dashboard-url.js';

const SLIP_PATH = /^\/s\/([a-z0-9][a-z0-9-]*)(\/.*)?$/i;

export type SlipPath = { name: string; rest: string };

/** `/s/engram` and `/s/engram/imports`. Null when this is not a slip URL. */
export function parseSlipPath(pathname: string): SlipPath | null {
	const match = pathname.match(SLIP_PATH);
	if (!match?.[1]) return null;
	let rest = match[2] ?? '/';
	if (!rest.startsWith('/') || rest.startsWith('//') || rest.includes('\\')) rest = '/';
	return { name: match[1].toLowerCase(), rest };
}

export type SlipSuggestion = { name: string; href: string };

export type SlipOpen =
	| { kind: 'redirect'; location: string }
	| {
			kind: 'page';
			status: number;
			title: string;
			heading: string;
			detail: string;
			hint: string;
			suggestions: SlipSuggestion[];
	  };

/** One edit: insert, delete, substitute, or an adjacent swap. */
export function editDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	const d: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
	for (let i = 0; i <= m; i++) d[i]![0] = i;
	for (let j = 0; j <= n; j++) d[0]![j] = j;
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			let best = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
				best = Math.min(best, d[i - 2]![j - 2]! + 1);
			}
			d[i]![j] = best;
		}
	}
	return d[m]![n]!;
}

/** Distance 1, or 2 when the typed name is long enough that two edits are still a typo. */
export function suggestSlipNames(typed: string, names: readonly string[], limit = 3): string[] {
	const max = typed.length >= 6 ? 2 : 1;
	return names
		.map((name) => ({ name, distance: editDistance(typed, name) }))
		.filter((row) => row.distance > 0 && row.distance <= max)
		.sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
		.slice(0, limit)
		.map((row) => row.name);
}

function suggestionHref(name: string, rest: string, search: string): string {
	const tail = rest === '/' ? '' : rest;
	const query = search.startsWith('?') ? search : '';
	return `/s/${name}${tail}${query}`;
}

/**
 * Where `/s/<name>` goes.
 * A remote host only follows a listener that is past loopback.
 */
export function decideSlipOpen(opts: {
	name: string;
	rest: string;
	search: string;
	hostHeader: string | null | undefined;
	lease: { port: number } | null;
	listening: boolean;
	listenBind: string | null;
	/** Other lease names. Used only when this name is not leased. */
	names?: readonly string[];
}): SlipOpen {
	const name = opts.name;
	if (!opts.lease) {
		const suggestions = suggestSlipNames(name, opts.names ?? []).map((hit) => ({
			name: hit,
			href: suggestionHref(hit, opts.rest, opts.search)
		}));
		return {
			kind: 'page',
			status: 404,
			title: `No slip named ${name}`,
			heading: `No slip named ${name}`,
			detail: 'That name is not leased on this machine.',
			hint: `localslip claim ${name} --port N`,
			suggestions
		};
	}
	const port = opts.lease.port;
	if (!opts.listening || !opts.listenBind) {
		return {
			kind: 'page',
			status: 404,
			title: `${name} is not up`,
			heading: `${name} is not up`,
			detail: `The lease is :${port}. Nothing is listening there.`,
			hint: 'Start it, then open this address again.',
			suggestions: []
		};
	}
	const pageHost = visitorPageHost(opts.hostHeader) ?? '127.0.0.1';
	const remote = !isLoopbackBind(pageHost);
	if (remote && isLoopbackBind(opts.listenBind)) {
		return {
			kind: 'page',
			status: 404,
			title: `${name} is on this computer only`,
			heading: `${name} is on this computer only`,
			detail: `Listening on ${opts.listenBind}:${port}.`,
			hint: 'Open it on the computer, or start the app on all interfaces so this address can reach it.',
			suggestions: []
		};
	}
	const base = visitorHttpUrl(pageHost, port);
	if (!base) {
		return {
			kind: 'page',
			status: 404,
			title: `${name} is not up`,
			heading: `${name} is not up`,
			detail: `The lease port ${port} is not a URL we can open.`,
			hint: 'Check the lease, then open this address again.',
			suggestions: []
		};
	}
	const path = opts.rest === '/' ? '' : opts.rest.replace(/^\//, '');
	const search = opts.search.startsWith('?') ? opts.search : '';
	return { kind: 'redirect', location: `${base}${path}${search}` };
}
