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

export type SlipOpen =
	| { kind: 'redirect'; location: string }
	| { kind: 'page'; status: number; title: string; heading: string; detail: string; hint: string };

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
}): SlipOpen {
	const name = opts.name;
	if (!opts.lease) {
		return {
			kind: 'page',
			status: 404,
			title: `No slip named ${name}`,
			heading: `No slip named ${name}`,
			detail: 'That name is not leased on this machine.',
			hint: `localslip claim ${name} --port N`
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
			hint: 'Start it, then open this address again.'
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
			hint: 'Open it on the computer, or start the app on all interfaces so this address can reach it.'
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
			hint: 'Check the lease, then open this address again.'
		};
	}
	const path = opts.rest === '/' ? '' : opts.rest.replace(/^\//, '');
	const search = opts.search.startsWith('?') ? opts.search : '';
	return { kind: 'redirect', location: `${base}${path}${search}` };
}
