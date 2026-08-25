import { proposeRecipe } from './recipeGuess.js';
import { getLease, recipeFor, setStartRecipe } from './registry.js';

export function saveGuessRecipe(name: string): {
	name: string;
	port: number;
	action: 'recipe' | 'skip';
	reason: string;
	cwd: string | null;
	command: string | null;
} {
	const lease = getLease(name);
	if (!lease) throw new Error(`no lease named "${name}"`);
	if (recipeFor(lease)) {
		return {
			name: lease.name,
			port: lease.port,
			action: 'skip',
			reason: 'recipe already stored',
			cwd: lease.startCwd ?? null,
			command: lease.startCommand ?? null,
		};
	}
	const guess = proposeRecipe(lease.name);
	if (!guess) {
		return {
			name: lease.name,
			port: lease.port,
			action: 'skip',
			reason: `no matching folder — localberth recipe ${lease.name} --cwd PATH`,
			cwd: null,
			command: null,
		};
	}
	const next = setStartRecipe(name, guess);
	return {
		name: next.name,
		port: next.port,
		action: 'recipe',
		reason: `saved ${guess.command}`,
		cwd: next.startCwd ?? null,
		command: next.startCommand ?? null,
	};
}
