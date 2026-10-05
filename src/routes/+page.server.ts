import { machineCard } from '$lib/machine';
import { getBoard } from '$lib/server/board';
import { visitorFeed } from '$lib/server/visitor-feed';
import { isOperatorFace, visitorPageHost } from '$lib/dashboard-url';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, getClientAddress, request }) => {
	const machine = machineCard();
	const hostHeader = request.headers.get('host');
	if (!isOperatorFace(getClientAddress(), hostHeader)) {
		const board = await getBoard({ showSystem: false });
		const feed = await visitorFeed(board.leaseRows, machine);
		return {
			face: 'visitor' as const,
			visitorTiles: feed.tiles,
			pageHost: visitorPageHost(hostHeader),
			hostHeader,
			showSystem: false,
			hiddenSystem: 0,
			leaseRows: [],
			observedRows: [],
			machine
		};
	}
	const showSystem = url.searchParams.get('system') === '1';
	return {
		face: 'operator' as const,
		...(await getBoard({ showSystem })),
		showSystem,
		visitorTiles: [],
		pageHost: null,
		hostHeader: null,
		machine
	};
};
