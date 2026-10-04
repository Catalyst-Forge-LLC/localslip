import type { Handle } from '@sveltejs/kit';
import { slipOpenHttp } from '$lib/server/slip-open';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/s/')) return resolve(event);
	const slip = await slipOpenHttp(
		event.url.pathname,
		event.url.search,
		event.request.headers.get('host'),
		event.request.method
	);
	if (!slip) return resolve(event);
	return new Response(slip.body, { status: slip.status, headers: slip.headers });
};
