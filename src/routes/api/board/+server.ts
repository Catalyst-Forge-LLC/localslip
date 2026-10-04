import { json, error } from '@sveltejs/kit';
import { isOperatorFace } from '$lib/dashboard-url';
import { getBoard } from '$lib/server/board';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, getClientAddress, request }) => {
	if (!isOperatorFace(getClientAddress(), request.headers.get('host'))) {
		throw error(403, 'Board API is loopback-only.');
	}
	const showSystem = url.searchParams.get('system') === '1';
	return json(await getBoard({ showSystem }));
};
