import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { recipeHealth } from './recipe-health.js';

describe('recipeHealth', () => {
	it('reports no recipe, missing cwd, missing script, and ok', () => {
		assert.equal(recipeHealth({ startCwd: null }).status, 'no-recipe');
		assert.equal(recipeHealth({ startCwd: join(tmpdir(), 'no-such-localslip-cwd') }).status, 'cwd-missing');

		const root = join(tmpdir(), `lb-health-${Date.now()}`);
		mkdirSync(root, { recursive: true });
		writeFileSync(join(root, 'package.json'), JSON.stringify({ scripts: { serve: 'node x' } }));
		assert.equal(recipeHealth({ startCwd: root, startCommand: 'pnpm site:dev' }).status, 'script-missing');
		assert.equal(recipeHealth({ startCwd: root, startCommand: 'pnpm serve' }).status, 'ok');
	});
});
