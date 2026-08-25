/** Strip one trailing -site/-api, then fold hyphens. `file` and `filepress` stay distinct. */
export function familyStem(id: string): string {
	let value = id.trim().toLowerCase();
	if (value.endsWith('-site') && value.length > 5) value = value.slice(0, -5);
	else if (value.endsWith('-api') && value.length > 4) value = value.slice(0, -4);
	return value.replace(/-/g, '');
}

export function familyRole(id: string): 'ui' | 'api' | 'site' {
	const value = id.trim().toLowerCase();
	if (value.endsWith('-api')) return 'api';
	if (value.endsWith('-site')) return 'site';
	return 'ui';
}

export function familyMemberNames(seed: string, names: Iterable<string>): string[] {
	const stem = familyStem(seed);
	if (!stem) return [];
	return [...names].filter((name) => familyStem(name) === stem);
}

export function isServeCommand(command: string | null | undefined): boolean {
	const value = (command ?? 'pnpm serve').trim();
	return value === 'pnpm serve' || value === 'pnpm run serve';
}
