import { bindsOverlap } from '../binds.js';
import { decideSlipOpen, parseSlipPath, type SlipOpen } from '../slip-open.js';
import { slipOpenPage } from '../slip-open-page.js';
import { scanListeners } from './observe.js';
import { getLease, listLeases } from './registry.js';

export type SlipHttp = {
	status: number;
	headers: Record<string, string>;
	body: string;
};

function listenBind(port: number, leaseBind: string, listeners: { port: number; bind: string }[]): string | null {
	const hits = listeners.filter((row) => row.port === port);
	const match = hits.find((row) => bindsOverlap(leaseBind, row.bind)) ?? hits[0] ?? null;
	return match?.bind ?? null;
}

export function slipHttpFrom(open: SlipOpen, method: string): SlipHttp {
	if (open.kind === 'redirect') {
		return {
			status: 302,
			headers: { location: open.location, 'cache-control': 'no-store' },
			body: method === 'HEAD' ? '' : ''
		};
	}
	return {
		status: open.status,
		headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
		body: method === 'HEAD' ? '' : slipOpenPage(open)
	};
}

/** Null when the path is not `/s/<name>`. */
export async function slipOpenHttp(
	pathname: string,
	search: string,
	hostHeader: string | null | undefined,
	method = 'GET'
): Promise<SlipHttp | null> {
	const parsed = parseSlipPath(pathname);
	if (!parsed) return null;
	if (method !== 'GET' && method !== 'HEAD') {
		return {
			status: 405,
			headers: { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' },
			body: method === 'HEAD' ? '' : 'Use GET.\n'
		};
	}
	const lease = getLease(parsed.name);
	const names = lease ? undefined : listLeases().map((row) => row.name);
	let listening = false;
	let observed: string | null = null;
	if (lease) {
		const listeners = await scanListeners();
		observed = listenBind(lease.port, lease.bind, listeners);
		listening = observed !== null;
	}
	const open = decideSlipOpen({
		name: parsed.name,
		rest: parsed.rest,
		search,
		hostHeader,
		lease: lease ? { port: lease.port } : null,
		listening,
		listenBind: observed,
		names
	});
	return slipHttpFrom(open, method);
}
