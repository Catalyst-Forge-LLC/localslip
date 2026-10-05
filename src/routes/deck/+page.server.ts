import { isOperatorFace, visitorPageHost } from '$lib/dashboard-url';
import { machineCard } from '$lib/machine';
import { getBoard } from '$lib/server/board';
import { visitorFeed } from '$lib/server/visitor-feed';
import type { PageServerLoad } from './$types';

/** The public tiles, including when the operator opens them from the lease table. */
export const load: PageServerLoad = async ({ getClientAddress, request }) => {
	const hostHeader = request.headers.get('host');
	const machine = machineCard();
	const board = await getBoard({ showSystem: false });
	const feed = await visitorFeed(board.leaseRows, machine);
	return {
		tiles: feed.tiles,
		pageHost: visitorPageHost(hostHeader),
		hostHeader,
		machine,
		boardLink: isOperatorFace(getClientAddress(), hostHeader)
	};
};
