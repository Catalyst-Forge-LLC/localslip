import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { proposeRecipe } from './recipeGuess.js';

const root = join(tmpdir(), `localberth-guess-${Date.now()}`);

after(() => {
	rmSync(root, { recursive: true, force: true });
});

function writePkg(dir: string, scripts: Record<string, string>): void {
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', scripts }));
}

describe('proposeRecipe', () => {
	it('maps a -site lease to the sibling folder and site:dev', () => {
		writePkg(join(root, 'aibreze'), { 'site:dev': 'pnpm --dir site dev', serve: 'echo no' });
		const guess = proposeRecipe('aibreze-site', { roots: [root] });
		assert.deepEqual(guess, { cwd: join(root, 'aibreze'), command: 'pnpm site:dev' });
	});

	it('uses pnpm serve when the folder matches the lease name', () => {
		writePkg(join(root, 'localhelm'), { serve: 'tsx src/cli/main.ts serve' });
		const guess = proposeRecipe('localhelm', { roots: [root] });
		assert.deepEqual(guess, { cwd: join(root, 'localhelm'), command: 'pnpm serve' });
	});

	it('returns null when no sibling package exists', () => {
		assert.equal(proposeRecipe('missing-app', { roots: [root] }), null);
	});
});
